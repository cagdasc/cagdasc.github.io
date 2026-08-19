I started building [DroidMind][1] as an experiment.

I wanted to understand what happens when you give an LLM the ability to interact with a real application. Not just generate code or answer questions, but actually look at an application, decide what to do, perform an action, and understand whether that action worked.

Android was a natural environment for me to experiment with, so I started with an emulator.

What initially looked quite simple quickly became more interesting.

## Giving an LLM hands

The first version was intentionally simple:

```text
User
  ↓
LLM
  ↓
Tools
  ↓
Android Emulator
```

The important part here is the **tools**.

An LLM can reason about what it should do, but it cannot tap a screen or inspect an emulator by itself. Tools provide the connection between the model and the environment.

In [DroidMind][1], these capabilities are split into different tool sets.

There are tools for managing the device, such as listing connected devices, finding installed packages and launching an application. There are tools for understanding the UI, such as retrieving the UI hierarchy or finding elements by text or type. And there are interaction tools for entering text, tapping, sending key events and scrolling.

This distinction is important.

A tool is not the agent itself. It is a capability that the agent can choose to use.

For example, if the user says:

> “Open YouTube and search for a video.”

the model needs to figure out that it first needs a device, then an application, then the current UI, then an interaction with the search field.

So the basic loop becomes:

```text
Observe → Reason → Act → Observe → ...
```

The model observes the environment through tools, reasons about what it sees, chooses a tool, performs an action, and receives new information.

This was my first realisation:

**An agent isn't simply an LLM with a prompt.**

It needs an environment, capabilities to interact with that environment, and feedback from those interactions.

## Then reality started getting complicated

The first experiments worked reasonably well for simple scenarios.

Then I started giving the agent longer tasks.

For example, a request like:

> Open YouTube, search for a video, verify that a particular result is visible, open it, and check the channel name.

is no longer just a sequence of taps.

The agent needs to understand where it is, what it needs to do next, and whether the previous operation produced the expected state.

The raw Android UI hierarchy also turned out to be a problem.

There can be a lot of informati on in a UI tree that isn't useful for reasoning. Giving everything directly to the model increases the amount of context it needs to process without necessarily making the application easier to understand.

This led me to introduce a UI representation that the agent can actually reason about. [DroidMind][1]'s UI tools work with an optimized hierarchy rather than simply exposing the raw hierarchy, and can also query that representation for specific element types or text.

But there was an even bigger problem.

**Performing an action is not the same as completing a task.**

A tap can succeed technically while producing the wrong application state.

The agent therefore needed another capability: verification.

## From tools to layers

At this point, I started separating the responsibilities of the system.

The tools provide the capabilities, while the strategy determines how those capabilities are used.

The architecture started looking more like:

```text
                         Agent Strategy
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
         Perception        Interaction      Verification
              │                │                │
       UI Hierarchy        UI Actions        UI State
              │                │                │
              └────────────────┼────────────────┘
                               ↓
                         Android Device
```

This separation became the foundation for the next version of the agent.

The interaction layer answers:

> **What action should I perform?**

The perception layer answers:

> **What is currently happening?**

And verification answers:

> **Did the application reach the state I expected?**

These are different problems, and treating them as separate responsibilities made the agent much easier to evolve.

## Planning before acting

Another problem appeared as soon as scenarios became longer.

Instead of asking the LLM to continuously figure out the entire task while interacting with the device, I started introducing an explicit execution plan.

The current [SteppedDeviceInteractionStrategy](https://github.com/cagdasc/droidmind/blob/main/STEPPED_DEVICE_INTERACTION_STRATEGY.md) first classifies the request, then rewrites it into a machine-readable ordered plan. That plan contains different types of steps: `INTERACTION` and `VERIFICATION`. The plan is persisted and executed step by step. 

Conceptually:

```text
User Request
     ↓
Classify
     ↓
Create Plan
     ↓
┌───────────────────────┐
│ Step 1: Interaction   │
│ Step 2: Interaction   │
│ Step 3: Verification  │
│ Step 4: Interaction   │
│ Step 5: Verification  │
└───────────────────────┘
     ↓
   Execute
```

This was an important shift.

The agent isn't just reacting to the latest screen anymore. It has a representation of the task it is trying to accomplish.

The strategy keeps track of the current step and the last interaction, allowing the next step to operate with state from the previous one. 

## Verification became a first-class part of the agent

Verification is particularly interesting because it doesn't need to perform another interaction.

Suppose the plan says:

```text
1. Search for "Me at the zoo"
2. Verify "Me at the zoo" is visible
3. Open the result
```

The second step isn't another action.

The agent needs to look at the current UI and decide whether the expected state exists.

In the strategy, verification steps use the previous interaction as context, inspect the current UI, and return a critic result containing whether the verification succeeded and feedback about what was found. 

That creates a more complete loop:

```text
             ┌───────────────┐
             │     Plan      │
             └───────┬───────┘
                     ↓
                Interaction
                     ↓
                  Observe
                     ↓
                Verification
                     ↓
             ┌───────┴───────┐
             │               │
          Success          Failure
             │               │
             ↓               ↓
        Next Step          Stop
```

This is where I started seeing the difference between **automation** and **agentic automation**.

A traditional automation script already knows what action to perform.

An agent has to interpret the environment and make decisions based on what it finds there.

## When one agent wasn't enough

As the strategy became more complex, I also started experimenting with how the reasoning itself should be structured.

Having one large agent responsible for classification, planning, interaction, verification and summarisation quickly becomes difficult to reason about.

This is where [Koog](https://docs.koog.ai/) and its strategy/subgraph model became useful.

The current strategy separates responsibilities into nodes such as:

* request classification,
* prompt rewriting,
* device and application identification,
* current-step execution,
* application interaction,
* verification,
* state persistence,
* and final summarisation.

It can be visualised as:

```text
                  Request
                     │
                     ↓
                Classify
                     │
                     ↓
                  Plan
                     │
                     ↓
             Identify Device/App
                     │
                     ↓
               Current Step
                 /       \
                /         \
        Interaction     Verification
             │                │
             ↓                ↓
           Store           Validate
             │                │
             └───────┬────────┘
                     ↓
                Next Step
                     │
                     ↺
```

This is the point where I stopped thinking about an agent as “an LLM that can call tools”.

It became a **system of reasoning and execution steps**, where tools provide capabilities and the strategy controls the flow between them.

## What I learned building it

[DroidMind][1] started as a relatively simple experiment: give an LLM access to an Android emulator and see what it can do.

The interesting part was everything that came afterwards.

The more capable I wanted the agent to become, the more important the surrounding architecture became.

The biggest lessons for me have been:

**Tools give the agent capabilities.**
They provide the bridge between reasoning and the real environment.

**Perception is a separate problem from interaction.**
The agent needs a useful representation of the application before it can reliably decide what to do.

**Planning gives the agent direction.**
Longer tasks become easier to manage when they can be represented as explicit steps.

**Verification closes the loop.**
An action is only useful if the agent can determine whether it produced the expected result.

**An agent is more than an LLM call.**
The interesting part is the system around the model: tools, state, strategies, feedback and the execution flow connecting them.

[DroidMind][1] is still an experiment. I'm continuing to explore how different agent strategies affect behaviour and how these systems can be evaluated.

For me, the most interesting part of the project is no longer simply making an LLM control an emulator.

It's understanding **what makes an agent actually capable of operating software**.

[1]: https://github.com/cagdasc/droidmind/