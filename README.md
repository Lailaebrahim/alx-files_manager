# alx-files_manager

## Concepts

### Async Programiing in Node.js
- JavaScript program is single-threaded. A thread is a sequence of instructions that a program follows. Because the program consists of a single thread, it can only do one thing at a time: so if it is waiting a long-running synchronous call to return, it can't do anything else.

- Node.js is built on top of the V8 JavaScript engine and the libuv library. libuv is a multi-threaded library that allows Node.js to perform I/O operations asynchronously. 

- Event Loop:
Libuv provides an event loop, which is a core part of Node.js. The event loop continuously checks for and processes events, such as I/O operations, timers, and callbacks. This allows Node.js to handle multiple operations concurrently without blocking the main thread.

- Thread Pool:
Libuv uses a thread pool to handle expensive or blocking operations, such as file system operations. When an I/O operation is initiated, libuv can offload it to a separate thread in the pool. Once the operation is complete, the result is passed back to the event loop, which then invokes the appropriate callback.

- Callbacks: Once the offloaded operation is complete, the result is passed back to the event loop, which then invokes the appropriate callback function. This callback mechanism ensures that the application can handle the result of the operation without blocking the main thread.
A callback is just a function that's passed into another function, with the expectation that the callback will be called at the appropriate time. when a callback have a callback this is called callback hell so instead of callbacks promises is used.

- Microtask queue (Task Queue) VS the macrotask queue:
The microtask queue is used for asynchronous operations that are triggered by the event loop, such as promises
The macrotask queue is used for asynchronous operations that are triggered by the event loop, such as setTimeout, setInterval, setImmediate, process.nextTick, and I/O operations.

1- Synchronous Code ("code")
    -This is regular, synchronous JavaScript code.
    It runs immediately in the main thread.
    It's part of the current "task" being executed.

2- Microtask Queue (Promises, async/await):
    - Microtasks are processed after the current synchronous code finishes, but before the next macrotask. They have higher priority than macrotasks.

3- Macrotask  Queue (setTimeout, setInterval, setImmediate, process.nextTick, I/O operations):
    - They are processed after all microtasks have been completed.
    Each iteration of the event loop processes one macrotask.

Then When using `setTimeout` with a specified delay, the delay represents the time before the callback is moved from the Web API (in browsers) or a thread (in Node.js) to the macrotask queue. The actual delay before execution can be longer than the specified delay. Once the delay has elapsed and the callback is moved to the macrotask queue, it may still wait for a few milliseconds if the call stack is busy with other tasks. The event loop will then move the callback to the call stack for execution once it is free. Which may result in increasing the overall time of the delay of that callback.

### Promises
- A promise is an object that represents the eventual completion (or failure) of an asynchronous operation and