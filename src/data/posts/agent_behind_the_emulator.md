# The Agent Behind the Emulator

I started building [**DroidMind**](https://github.com/cagdasc/droidmind) as an experiment to explore what happens when you give a Large Language Model (LLM) the ability to interact directly with a real mobile application. I wanted to understand whether a model could look at a screen, interpret what is happening, decide on an action, execute it on an Android emulator, and verify whether that action achieved the expected result.

What initially looked like a straightforward problem quickly became a far more interesting engineering puzzle. 

Connecting an LLM to an emulator is relatively easy, but making that interaction reliable for automated blackbox testing is difficult. The primary hurdle isn't model parameter size or prompt wording, but bridging the gap between **stochastic reasoning** and **deterministic execution**. 

In this post, I want to share what I learned through this exploration: why unconstrained tool-calling breaks down, why user intent must be decoupled from UI topology, and how transitioning to a **layered state-graph architecture** made agentic testing predictable.

## 1. The Cognitive Limits of Unconstrained Tool-Calling

In my first experiments, I took the most intuitive approach: I exposed every available device tool to the LLM inside a single, open-ended prompt loop. In this model, the LLM received the overall task alongside a suite of low-level tools—such as launching apps, inspecting layout trees, tapping coordinates, entering text, and capturing screenshots.

```text
               ┌─────────────────────────────────────────┐
               │         User Request + All Tools        │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │   Monolithic LLM   │ ◄──┐
                         └──────────┬─────────┘    │
                                    │              │ (Infinite Loop)
                                    ▼              │
                         ┌────────────────────┐    │
                         │    Device Tool     │ ───┘
                         └────────────────────┘

```

While conceptually simple, this unconstrained model quickly proved unpredictable for non-trivial workflows:

* **High Cognitive Load & Decision Paralysis:** Forcing the model to simultaneously interpret high-level business goals, parse dense view hierarchies, and choose among dozens of granular tools led to moving action choices.


* **State Drift:** Without enforced execution boundaries, the model would frequently attempt downstream UI steps before essential prerequisites—such as application launching or device provisioning—were complete.


* **Context Pollution:** Accumulating raw, unformatted view hierarchies across multiple loop iterations flooded the context window, causing the model to hallucinate UI elements or get stuck in repetitive actions.

## 2. Decoupling Intent from UI Topology

One of the most important realizations from testing real applications was that **UI layouts are transient, whereas user intent is invariant**.

Consider a money transfer transaction: the user's intent ("Transfer £10 to a recipient") remains constant across app updates. However, the interface topology used to fulfill that intent can vary dramatically:

* **Interface Variant A:** Requires tapping an input field, invoking the soft keyboard, and manually typing digits. 
[Check the recording](videos/manual_amount_entry.mp4)

* **Interface Variant B:** Displays contextual quick-select chips (`£10`, `£50`, `£100`) directly next to the input field. [Check the recording](videos/quick_amount_selection.mp4)


```text
                       ┌─────────────────────────┐
                       │      User Intent        │
                       │   "Set Amount to £10"   │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │    Perception Layer     │
                       └────────────┬────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │ Manual Input UI  │                │ Quick Select UI  │
        ├──────────────────┤                ├──────────────────┤
        │ 1. Tap Field     │                │ 1. Tap "£10" Chip│
        │ 2. Type "10"     │                │                  │
        └──────────────────┘                └──────────────────┘

```

Traditional test automation scripts break when interface elements change because they are tightly coupled to explicit locators like static resource IDs or absolute XPaths.

An agentic architecture resolves this by introducing an explicit **Perception Abstraction**. Instead of feeding raw Android view trees containing hundreds of layout containers and accessibility nodes to the model, a layout resolver transforms the raw tree into a semantic representation. The agent perceives actionable affordances (e.g., input fields, buttons, options) rather than structural implementation details, allowing it to map a static intention onto changing visual representations.

## 3. The Architecture: Layered State-Graph Strategy

To bring structure and determinism to DroidMind, I replaced the open-ended prompt loop with a **Directed State Graph** strategy ([`SteppedDeviceInteractionStrategy`](https://github.com/cagdasc/droidmind/blob/main/mind/agent/src/commonMain/kotlin/com/cacaosd/droidmind/agent/strategy/SteppedDeviceInteractionStrategy.kt)).

In this strategy, execution is modeled as a sequence of discrete, typed states with explicit transitions, session-bound storage, and localized tool scoping.

```text
                      ┌───────────────────────────┐
                      │    User Request Input     │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │  0. Request Classification│ ──(Out of Scope)──► [ Exit / Reject ]
                      └─────────────┬─────────────┘
                                    │ (In Scope)
                                    ▼
                      ┌───────────────────────────┐
                      │  1. Rewrite & Plan Task   │ ──► Generates Ordered Plan
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │  2. Device Identification │ ──► Provision Device & App
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐ ◄─────────────────┐
                      │  3. Step Execution Loop   │                   │
                      └──────┬─────────────┬──────┘                   │
                             │             │                          │
          (Interaction Step) │             │ (Verification Step)      │
                             ▼             ▼                          │
                     ┌──────────────┐  ┌──────────────┐               │
                     │ App          │  │ Interaction  │               │
                     │ Interaction  │  │ Verification │               │
                     └──────┬───────┘  └──────┬───────┘               │
                            │                 │                       │
                            └────────┬────────┘                       │
                                     │                                │
                                     ▼                                │
                      ┌───────────────────────────┐                   │
                      │ 4. State & Plan Update    │ ──(Has More Steps)┘
                      └─────────────┬─────────────┘
                                    │ (Plan Finished)
                                    ▼
                      ┌───────────────────────────┐
                      │  5. Result Summarization  │ ──► [ Output Final Summary ]
                      └───────────────────────────┘

```

### Stage Breakdown

#### Stage 0: Scope Gatekeeping (Classification)

The initial graph node evaluates whether the incoming request strictly pertains to mobile application testing or device operations. If the request falls outside this domain, the graph terminates immediately, avoiding unnecessary computational overhead.

#### Stage 1: Goal Decomposition & Planning

When a request is in scope, a specialized node rewrites the prompt into a structured, ordered plan stored directly in the session context. This plan breaks the goal into atomic steps categorized by type:

* **`INTERACTION` Steps:** State-changing operations such as launching apps, tapping controls, or typing text.


* **`VERIFICATION` Steps:** Non-mutating observation passes designed to inspect interface states and validate outcomes.



#### Stage 2: Environment Provisioning

Before attempting UI operations, a setup node identifies connected emulators, confirms device readiness, and launches the target application. If provisioning fails, the execution stops with an explicit error rather than attempting invalid UI interactions.

#### Stage 3: Step Dispatching & Tool Scoping

The core execution loop reads the current step from storage and routes the agent to the corresponding node. Crucially, **tool availability is strictly restricted per state**:

* During an **Interaction State**, the model only receives UI hierarchy resolvers and interaction tools.


* During a **Verification State**, input tools are stripped away; the model receives only inspection capabilities to evaluate state conditions.

Scoping tools to specific states eliminates tool-selection ambiguity and keeps the model focused on the immediate task.

#### Stage 4 & 5: State Advancement & Summarization

After executing a step, the interaction result is stored, the step index increments, and the graph checks whether more steps remain. Once all steps in the plan are processed, the graph transitions to a final node that aggregates execution logs and generates a summary report.

## 4. Action Is Not Completion: First-Class Verification

Another key finding during this experiment was that executing an action successfully does not guarantee the task succeeded. A tap event can execute perfectly at the OS level while the application remains stuck on the same screen due to validation errors, network delays, or unexpected popups.

In a graph-driven architecture, **verification is treated as an independent execution phase rather than a side effect**.

```text
                  ┌───────────────────────────┐
                  │    Execute Interaction    │
                  └─────────────┬─────────────┘
                                │
                                ▼
                  ┌───────────────────────────┐
                  │      Perceive UI Tree     │
                  └─────────────┬─────────────┘
                                │
                                ▼
                  ┌───────────────────────────┐
                  │ Evaluate Expected Condition│
                  └─────────────┬─────────────┘
                                │
                      ┌─────────┴─────────┐
                      ▼                   ▼
                [ State Valid ]     [ State Invalid ]
                      │                   │
                      ▼                   ▼
               Advance Step Index    Trigger Retry / Strategy

```

By enforcing a dedicated verification pass after key interactions, the agent evaluates state transitions systematically:

1. **Execution:** The interaction node executes the required action.


2. **Re-Perception:** The graph re-evaluates the view hierarchy to capture the updated state.


3. **State Assertion:** The verification node confirms whether expected visual anchors (e.g., success messages, updated balances, screen title changes) are present before advancing the plan.

## 5. Key Takeaways for Agent Engineers

* **Tools Are Capabilities; Workflows Are Behaviors:** Low-level capabilities (`tap`, `scroll`, `read_hierarchy`) handle OS interactions without understanding task context. The orchestration graph defines domain behavior by constraining when and how those tools are invoked.


* **Isolate Reasoning Contexts:** Minimize cognitive load by splitting multi-step tasks into dedicated graph nodes. An LLM evaluating an assertion should not be burdened by text-entry tools or device-configuration options.


* **Perception Precedes Action:** Raw layout trees clutter context windows. Filtering view hierarchies into semantic elements allows the agent to reason about application state rather than layout implementation details.


* **Model Workflows as Typed State Machines:** Utilizing explicit graphs with typed steps, state storage, and conditional transitions converts unpredictable agent behavior into an auditable, reproducible engineering pipeline.


## 6. Conclusion

Controlling a mobile application via an AI agent is fundamentally an architectural problem rather than a prompting challenge. While LLMs provide the localized reasoning necessary to adapt to visual variations, the system’s overall reliability depends on the surrounding graph.

By decoupling intent from UI topology, scoping tool accessibility to specific states, and treating verification as a first-class execution phase, we can build agents that operate predictably in complex software environments. The emulator is merely the environment where these interactions take place; the real value lies in the layers engineered between **intention and execution**.

To explore the strategy implementation, check out the **[DroidMind repository on GitHub](https://github.com/cagdasc/droidmind)**.