# Code Editor
CodeEditor improves development speed by minimizing wasted work, anticipating developer intents, and making code behavior visible.

## The problem
We write code by trial and error. Our trials may be informed by documentation and theory, but unless we write bug free code most of our trials have errors.

The more code we write before we try, the harder it is to find the error. If a one line change produces an error, these are several possible sources:

1. The line itself is in error. It might be syntactically incorrect, or have a misspelled variable name. If the error shows up as soon as the line runs, it's easy to fix.

2. The line invokes a subordinate function with wrong parameters. If the error shows up as soon as the line runs, it's fairly easy to fix. (And if the development environment is able to compare valid invocations to invalid, possibly even easier)

3. The invoked function may be part of a set of functions that must first be initialized, or put in a state before the invoked function is called. Adding one or more line that initialize the functions sets the state fixes the error.

4. The invoked function or one of its descendants has a bug. This is the hardest case. The problem  might reveal a bug in the subordinate function or one below it and require walking through a great deal of code. It might be highly state dependent and it might be hard to determine the state that produces the problem.

## Constraining the problem
Let's consider systems that consist of multiple intercommunicating parts, each of which behaves as follows:

### Entities
A system consists of a set of communicating entities. Typically communication takes place between a server and multiple clients. But other patterns are possible: for example a client can communicate with multiple services; or several clients can communicate one with another.

Within the system, each entity has a unique entity identifier. When entities communicate the ids are used to identify the sending and receiving entities for a message communicated between the two.


### Properties

1. An entity's behavior is determined by its state.

2. An entity's state is contained in a single data structure. The data structure can be composed from sub-structures.

3. State structures behave as though they are immutable. In general they are actually immutable. That is: an existing structure is never changed. Instead, an instance is replaced by a new, updated instance. In some case the immutable property is the ability to restore the state to an earlier time.

4. Each state structure is changed only by a single reducer functions that maps an old states into new state. Reducers are pure functions with no side effects. Reducers take as a second argument an action, which determines how the state is transformed.

5. Actions can be logged and replayed. Since reducers are pure functions, re-applying an action to a old state always gives the same new state.

6. Actions can be dispatched either within an entity (client or server) or across entities (client to server or server to client).


### Actions
An action has a source and one or more destinations. By default the source and the destination are the same. In this case neither the source nor the destination need be specified.

Each action is assigned a local identifier before it's dispatched.

If an action triggers one or more other actions, each triggered action contains a reference to the action that triggered it.

### Dispatching actions








## Signal to noise ratio
Code is hard to develop A developer who makes a code change is interested only in a signal that shows how the change affected the program's output and execution, and is looking for evidence in that signal that change met its goal. Everything else is noise.

In conventional development, after some set of changes, a developer reruns the program, examines the output and must determine that the output is correct. Most of that output is noise. Only a small amount is signal.

Separating signal from noise is time-consuming and wasted effort.
Test Driven Development attempts to make things easier by having a test and a testing framework examine the output and determine that it's correct. But until a test is itself known to be correct, writing tests makes the problem bigger: is the problem in the test? Or it in the code being tested? 

Each statement in a program serves a purpose. As each new statement is written a developer wants to see evidence that that statement met its purpose--and did not make any unexpected changes--and do so without wasted effort.

Once a program 



When a program runs, it makes lots of internal state changes. Most of those changes are noise; only a few are signal. The vast amount of noise obscures the smaller signal.
Only the --only part of which is relevant to the task at hand, and sees none of the internal state change, or the execution path. When examining execution path and internal state is important, developers enter log statements that will later be removed (wasteful effort) or step through code (wasteful effort). Worse: a log statement my emit relevant information only at a certain point in the execution path. 

## An ideal environment
Developers can edit code while in the debugger. For large scale changes (which should be done rarely) a full-featured editor is the best choice. But for smaller changes, for incremental development, and for fixing bugs a debugger that lets you edit code is best.

 As developers make changes the debugger infers what information about the changed state of the program would be interesting to the developer, and highlights that information. Developers can provide feedback so that the debugger's inferences match the developer's desires.
 
 
 For example, if a line of code changes the value of a variable, that change is interesting. But the values of all variables that are unchanged are less interesting. A line of code that's executed is more interesting than one that's not executed. A line of code that's executed for the first time following a change is more interesting than one that's been repeatedly executed.

As each line of code is entered, a minimal amount of code--including that line--is compiled, and if it's valid code, then a code--including te line--is executed. If there are tests then tests that cover the code are run.

The system indicates compilation errors, execution errors, or test errors (see testing, below) in a way that doesn't get in the developer's way.

The system makes the behavior 

## The problem with testing
Some people use Test Driven Development (TDD), writing tests before they write code. Some write fine grained tests and some write coarse-grained tests. Some develop their code without tests, then write tests after-the fact to detect regressions as they change code.

When there's a bug, think of the cause of the problem as a needle, and the pile of code where the needle might appear as the haystack. A test is a needle detector--a good thing. But tests always increase the size of the haystack--you never know if the cause of the failure is in the test code or the code under test.

If write granular tests, it will almost certainly take more time to write a set of tests than to write the code. And while you are when there's a bug it's not clear if it's in the code, or in the test. If you write coarse-grained tests, then when a test fails the haystack (pile of code) that hides the cause of failure is larger than the code you are testing (it includes the test code, too.)

## Sections
//Section name:<name> bind:<name> plugins[<list>]