# Code Editor
CodeEditor improves development speed by reducing the cycle time for changes and making code behavior visible.

## The problem
We write code by trial and error. Our trials may be informed by documentation or theory, but unless we write 100% perfect bug free code our trials have errors.

CodeEditor helps us find errors faster, discover their causes faster, and fix them faster.

There are several reasons that developing code takes so much time. First, what you are trying to implement doesn't solve the problem that you are trying to solve.

Some are related to code that you rely on:

1. There are bugs in the code
2. The code is not buggy, but your understanding is.


Some of these things are related to code that you are writing:

1. Time spent doing things that don't produce useful functionality
2. Time spent locating the cause of an error
3. Time spent figuring out where to insert the code for a change


## The problem with testing
Some people Test Driven Development, writing tests before they write code. Of those, some write fine grained tests some write coarse-grained tests. Some develop their code without tests, then write tests after-the fact to detect regressions as they change code.

When there's a bug, think of the cause of the problem as a needle, and the pile of code where the needle might appear as the haystack. A test is a needle detector--a good thing. But tests always increase the size of the haystack--you never know if the cause of the failure is in the test code or the code under test.

If write granular tests, it will almost certainly take more time to write a set of tests than to write the code. And while you are when there's a bug it's not clear if it's in the code, or in the test. If you write coarse-grained tests, then when a test fails the haystack (pile of code) that hides the cause of failure is larger than the code you are testing (it includes the test code, too.)

## Sections
//Section name:<name> bind:<name> plugins[<list>]