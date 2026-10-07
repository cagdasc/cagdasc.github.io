# The Agent Behind the Emulator

I started building DroidMind as an experiment.

I wanted to understand what happens when you give an LLM the ability to interact with a real application.

Not just generate code or answer questions, but actually look at an application, understand what is happening, decide what to do, perform an action, and determine whether that action achieved the expected result.

Android was a natural environment for me to experiment with, so I started with an emulator.

What initially looked like a simple problem quickly became more interesting.

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

An LLM cannot directly tap a screen, inspect an Android UI hierarchy, or enter text into an emulator. Tools provide that connection between the model and the environment.

DroidMind started with relatively low-level capabilities:

* Discover connected devices
* Find installed applications
* Launch applications
* Inspect the UI hierarchy
* Find UI elements
* Tap elements
* Enter text
* Send key events
* Scroll
* Capture screenshots

With these capabilities, it is already possible to give the model a task such as:

> Open "AI Money Transfer" app and Transfer 10 pounds to 00-00-01 12985684 account and verify it is successful.

The model can inspect the screen, choose a tool, receive the result, and continue.

But there is a problem with this approach. The model is being asked to figure out **everything**.

It has to understand the task, decide what information it needs, interpret the UI, determine which tool to use, perform the action, and decide whether the result is correct.

That can work for simple interactions. It becomes much less predictable as the task becomes more complex.

## The UI is not the intention

Consider a money transfer flow. The intention might be:

> Transfer £10 to a recipient.

That intention is relatively stable. The UI is not.

I have two recordings of the same transfer flow. Both are trying to accomplish the same thing, but the screens are different.

In one version, the user manually enters the transfer amount.

[Executing Money Transfer flow by entering amount manually](videos/manual_amount_entry.mp4)

In the other, the application provides quick amount selections alongside the amount input.

[Executing Money Transfer flow by picking amount](videos/quick_amount_selection.mp4)

The rest of the flow can also change. Buttons can move. Labels can change. Additional screens can appear.

Different UI components can represent the same business action.

Yet from the user's perspective, the intention remains the same:

```text
Transfer money
```

This distinction is important.

If an agent is built around specific UI actions, then these two screens represent two different automation problems.

If the agent is built around the **intention**, they are two representations of the same problem.

That is the abstraction I wanted DroidMind to explore.

The goal is not to teach the agent how to tap a particular button.

The goal is to give it enough understanding of the environment that it can determine which available action represents the intention **in the current UI**.

## From one prompt to a workflow

My first instinct was to let the LLM handle this itself.

Give it the complete task:

> Open "AI Money Transfer" app and Transfer 10 pounds to 00-00-01 12985684 account and verify it is successful.

Then expose all available tools and let the model decide what to do.

Conceptually:

```text
User Request
     ↓
    LLM
     ↓
  Any Tool
     ↓
  Android
     ↓
    LLM
     ↓
  Any Tool
     ↓
    ...
```

This is appealing because it is simple.

It is also asking the model to solve too many different problems at once.

Instead, I started introducing **workflow layers**.

The idea is to make the process more granular without taking the reasoning away from the LLM.

The LLM still makes decisions.

But each decision happens within a smaller, more clearly defined responsibility.

The architecture started moving towards:

```text
                User Intent
                     ↓
                Task Workflow
                     ↓
                 Perception
                     ↓
                  Decision
                     ↓
                Interaction
                     ↓
                Verification
                     ↓
                  Next Step
```

The tools remain the capabilities. The workflow determines **how those capabilities are composed to complete the task**. That distinction turned out to be important.

## Perception before interaction

One of the first things I learned was that giving the model the raw UI hierarchy is not necessarily useful.

A modern Android screen can contain hundreds of nodes.

Many of them are irrelevant.

A raw hierarchy might contain containers, layout nodes, accessibility information, bounds, duplicated text and implementation details that have no value for the current task.

So instead of simply exposing the raw hierarchy, DroidMind transforms it into a representation that is easier for an agent to reason about.

Conceptually:

```text
Android UI
    ↓
Raw UI Hierarchy
    ↓
Hierarchy Resolver
    ↓
Optimised Hierarchy
    ↓
Agent
```

The purpose is not just to reduce tokens.

It is to expose the parts of the UI that have semantic meaning for the task.

For example, instead of making the model reason about a large tree of implementation details, it can work with meaningful elements such as:

```text
Screen
 ├── Amount Input
 ├── Quick Amount: £10
 ├── Quick Amount: £50
 ├── Quick Amount: £100
 ├── Quick Amount: £250
 ├── Account number
 ├── Sort code
 └── Continue
```

Now the model can reason about the screen rather than the implementation of the screen.

This is where perception becomes a separate layer.

The perception layer answers:

> What is currently happening?

It does not decide what the user ultimately wants. It creates the representation that allows the next layer to make that decision.

## Workflow layering

Once perception became a separate concern, the rest of the system started to become clearer.

Rather than giving the LLM every possible tool and asking it to figure out the entire workflow, I could define smaller workflow stages around specific responsibilities.

For example:

```text
      User Request
           ↓
┌─────────────────────┐
│ Intent / Task       │
│ Understanding       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Perception          │
│ Understand UI       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Action              │
│ Decide what to do   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Interaction         │
│ Execute action      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Verification        │
│ Check result        │
└─────────────────────┘
```

This does not mean that every layer is deterministic. Quite the opposite. The LLM can still reason inside these layers.

The difference is that the reasoning is constrained by a specific responsibility.

For example, the interaction layer does not need to figure out what the entire user request means.

It needs to answer a much smaller question:

> Given the current UI and the current intended action, how should I perform this action?

That makes the toolset and the context available to the model much more focused.

## The same intention, different UI

This is where the two transfer screens become useful. Imagine the agent has reached the amount step.

The intended action is:

```text
Enter £10
```

On one screen, the correct interaction might be:

```text
Tap Amount
→ Input "10"
```

On another:

```text
Tap Quick Amount "£10"
```

A traditional automation script might require two separate implementations.

The agent does not necessarily need to know that these are two different test cases.

It needs to perceive both screens and map the same intention to the appropriate interaction.

So the workflow becomes:

```text
              Intended Action
                    │
                    ↓
             "Set amount to £10"
                    │
                    ↓
               Perception
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
     Amount Input        Quick Amount
          │                   │
          ↓                   ↓
      Enter "10"           Tap "£10"
```

The UI changed but the **workflow did not**. That is the abstraction I am interested in.

## Interaction is not completion

Another important distinction appeared when I started adding verification.

Performing an action successfully does not necessarily mean the task succeeded.

A tap can be executed correctly while the application moves into an unexpected state.

Text can be entered into the wrong field or a button can be pressed while a validation error remains on screen. The agent therefore needs to understand not only:

> What action should I perform?

but also:

> Did that action produce the state I expected?

This introduced verification as a first-class layer.

```text
Perceive
   ↓
Decide
   ↓
Interact
   ↓
Perceive again
   ↓
Verify
```

For the transfer example, the workflow might look like:

```text
1. Navigate to transfer
2. Set transfer amount
3. Select recipient
4. Review transfer details
5. Confirm transfer
6. Verify transfer success
```

The interesting part is that not every step is an interaction. Some steps are about understanding the current state. Some are about changing it. Some are about proving that the expected state was reached.

This makes the workflow more explicit:

```text
             ┌─────────────┐
             │    Intent   │
             └──────┬──────┘
                    ↓
               Perception
                    ↓
                Decision
                    ↓
               Interaction
                    ↓
               Perception
                    ↓
               Verification
                    │
             ┌──────┴──────┐
             ↓             ↓
          Success        Failure
             │
             ↓
         Next Step
```

## Why make it more granular?

At this point, the obvious question is:

> Why not just give the LLM the whole task and let it figure everything out?

Because the objective is not simply to make the model capable of calling tools.

It is to build an agent that can operate an environment in a way that is understandable, controllable and reusable.

A single large reasoning loop makes it difficult to understand why an action was chosen.

With a more granular workflow, each stage has a clearer contract.

For example:

**Perception**

> Understand the current application state.

**Interaction**

> Execute the intended action using the current UI.

**Verification**

> Determine whether the expected state has been reached.

The model can still reason.

But it is reasoning about the right problem at the right time. This also means that improvements to one layer do not necessarily require changing everything else.

A better hierarchy representation can improve perception.

A better interaction layer can improve action selection.

A better verification layer can improve confidence in the result.

The layers give those improvements somewhere to live.

## Tools are capabilities, workflows define behaviour

This became one of the most important architectural distinctions in DroidMind.

Tools answer:

> What can the agent do?

Workflows answer:

> How should those capabilities be composed to complete the task?

For example, a `tap` tool is a capability.

It knows how to tap a coordinate or UI element.

It does not know whether tapping that element makes sense for the current task.

Similarly, a UI hierarchy tool can retrieve the current screen.

It does not know which part of that screen matters.

That responsibility belongs to the workflow.

So the architecture becomes:

```text
                  Agent
                    │
              ┌─────┴─────┐
              │  Workflow │
              └─────┬─────┘
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
     Perception  Interaction  Verification
          │         │         │
          └─────────┼─────────┘
                    ↓
                  Tools
                    ↓
              Android Device
```

This separation is what makes the system interesting to me.

The tools are relatively straightforward.

The difficult part is deciding how those tools should be composed into behaviour.

## The emulator is just the environment

When I started DroidMind, I thought the interesting question would be:

> How do I make an LLM control an Android emulator?

I don't think that is the interesting question anymore.

The emulator is just an environment where the problem becomes visible.

The more interesting question is:

> How should an agent understand an environment well enough to act on an intention rather than simply react to UI elements?

The two transfer screens illustrate that problem quite well.

The UI can change.

The intention can remain the same.

If the agent is tightly coupled to the UI implementation, every change becomes another automation problem.

If the agent can perceive the environment, reason about the current state, and select an appropriate interaction workflow, the UI becomes an implementation detail rather than the definition of the task.

That is what I am exploring with DroidMind.

Not simply giving an LLM more tools.

Not simply making it click buttons.

But building the layers between **intention and action** that allow the model to understand what those tools mean in the environment it is operating in.

And I suspect that the quality of those layers may matter just as much as the model itself.
