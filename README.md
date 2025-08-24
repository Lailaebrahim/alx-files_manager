# alx-files_manager

## Concepts

### Async Programming in Node.js

- **Single-threaded Nature**: JavaScript programs are single-threaded, meaning they can only execute one task at a time. If a long-running synchronous call is made, it blocks the main thread, preventing other operations.
- **Node.js and libuv**: Node.js is built on the V8 JavaScript engine and the libuv library. libuv is multi-threaded and allows Node.js to perform I/O operations asynchronously.
- **Event Loop**: The event loop, provided by libuv, continuously checks for and processes events like I/O operations, timers, and callbacks. This enables Node.js to handle multiple operations concurrently.
- **Thread Pool**: libuv uses a thread pool for expensive or blocking operations, such as file system operations. These operations are offloaded to separate threads, and their results are passed back to the main thread.
- **Callbacks**: Callbacks are functions passed into other functions to be executed once an operation is complete. They prevent blocking the main thread. However, nested callbacks can lead to "callback hell".
- **Microtask vs. Macrotask Queues**:
    - **Microtask Queue**: Used for asynchronous operations triggered by the event loop, such as promises.
    - **Macrotask Queue**: Used for operations like `setTimeout`, `setInterval`, `setImmediate`, `process.nextTick`, and I/O operations.

1. **Synchronous Code**: Regular JavaScript code that runs immediately in the main thread as part of the current task.
2. **Microtask Queue**: Processes microtasks (e.g., promises) after the current synchronous code finishes but before the next macrotask.
3. **Macrotask Queue**: Processes macrotasks (e.g., `setTimeout`) after all microtasks are completed. Each event loop iteration processes one macrotask.

- **setTimeout Delay**: The specified delay represents the time before the callback is moved to the macrotask queue. The actual delay can be longer due to the call stack being busy with other tasks.

#### Promises

- **Definition**: A promise represents the eventual completion (or failure) of an asynchronous operation and its resulting value.
- **States**: A promise can be pending, fulfilled, or rejected.
- **Creation**: Created using the `Promise` constructor with a callback function.
- **Chaining**: Promises can be chained using the `then()` method.
- **Rejection**: Promises can be rejected using the `reject()` method.
- **Resolution**: Promises can be resolved using the `resolve()` method.
- **Cancellation**: Promises can be canceled using the `cancel()` method.
- **Awaiting**: Promises can be awaited using the `await` keyword.
- **Methods**: `Promise.all`, `Promise.race`.

#### Async/Await

- **Syntax Sugar**: `async/await` is syntax sugar on top of promises for cleaner and more readable code.
- **Async Functions**: Functions prefixed with `async` always return a promise.
- **Await Keyword**: `await` pauses the execution of the async function until the promise resolves or rejects.

### Redis

- **In-memory Data Store**: Redis can be used as a database, message broker, and cache.
- **NoSQL Database**: Stores data in a key-value format.
- **Data Structures**: Supports strings, hashes, lists, sets, and maps.
- **Transactions**: Allows atomic operations on multiple keys.
- **Pub/Sub Messaging**: Enables real-time communication between clients.
- **Clustering**: Supports horizontal scaling and high availability.

#### Node Redis

- **Redis Client**: Provides a simple API for interacting with Redis.
- **Connection Management**: Handles connection establishment, reconnection strategies, and connection pooling.
- **Commands**: Methods corresponding to Redis commands.
- **Promises and Callbacks**: Supports both Promise-based and callback-based APIs.
- **Pipelining**: Allows sending multiple commands without waiting for replies.
- **Pub/Sub**: Supports Redis's publish/subscribe messaging.
- **Transactions**: Supports Redis transactions for atomic operations.
- **Lua Scripting**: Executes Lua scripts on the Redis server.
- **Streams**: Supports Redis Streams, a log-like data structure.

### MongoDB

- **NoSQL Database**: Stores data in BSON (Binary Serialized Object Notation).
- **Document-oriented**: Stores data in documents, collections, and databases.
- **Schema-less**: Does not require a predefined schema.
- **Distributed**: Can be scaled horizontally by adding more nodes.

#### MongoDB Driver for Node.js

- **High-level API**: Allows Node.js applications to interact with MongoDB databases.
- **Translation**: Converts JavaScript code into MongoDB commands.
- **Components**:
    - **MongoClient**: Connects to MongoDB and manages the connection lifecycle.
    - **Db**: Represents a database on the MongoDB server.
    - **Collection**: Represents a collection in a MongoDB database.
    - **ObjectId**: Handles MongoDB's unique identifiers.
    - **BSON**: Works with MongoDB's binary data format.
- **ODMs**: Higher-level Object Document Mappers like Mongoose provide additional features like schema validation and middleware.

---

## Project Documentation: Files Manager API

### Overview

The **alx-files_manager** project is a RESTful File Manager API built primarily with Node.js (JavaScript) and some Python. It enables users to upload, retrieve, share, and manage files securely and efficiently. It demonstrates concepts from asynchronous programming, caching, and NoSQL databases.

### Features

- **User Authentication:** token-based authentication.
- **File Upload:** Upload files and folders with metadata.
- **File Retrieval:** Download, preview, or list files and folders.
- **File Sharing:** Publish or unpublish files for public access.
- **Folder Hierarchy:** Organize files into folders and subfolders.
- **Database Integration:** Uses MongoDB for storing metadata and Redis for caching.
- **Efficient Performance:** Asynchronous, non-blocking request handling.

### API Endpoints

#### Authentication

- **Sign Up:** `POST /users`
    - Body: `{ "email": "user@example.com", "password": "yourpassword" }`
    - Response: User details (excludes password)
- **Sign In:** `GET /connect` (Basic Auth header)
    - Response: `{ "token": "<auth_token>" }`
- **Sign Out:** `GET /disconnect` (Header: `X-Token`)

#### Files

- **Upload File:** `POST /files`
    - Headers: `X-Token`
    - Body: `{ "name": "filename.txt", "type": "file|folder|image", "data": "<base64data>", "parentId": "<optional>" }`
    - Response: Metadata of uploaded file
- **List Files:** `GET /files?parentId=<optional>&page=<optional>`
    - Headers: `X-Token`
    - Response: Array of file metadata
- **Get File Info:** `GET /files/:id`
    - Headers: `X-Token`
    - Response: Metadata of the file
- **Publish/Unpublish File:** `PUT /files/:id/publish` or `PUT /files/:id/unpublish`
    - Headers: `X-Token`
    - Response: Updated file metadata
- **Get File Content:** `GET /files/:id/data`
    - If file is published, no token required. Otherwise, add `X-Token` header.
    - Response: Raw file data (download or preview)

#### User

- **Get User Info:** `GET /users/me`
    - Headers: `X-Token`
    - Response: `{ "email": "user@example.com", "id": "<user_id>" }`

### Project Structure

```
alx-files_manager/
├── controllers/         # API endpoint logic
├── routes/              # Express route definitions
├── utils/               # Utility functions
├── models/              # Database models
├── server.js            # Application entry point
├── README.md            # Documentation
├── tests/               # Automated tests
```

### Getting Started

1. **Install Dependencies:**
   ```sh
   npm install
   ```
2. **Set up environment variables:**  
   Create a `.env` file for database and server configuration.
3. **Run the API server:**
   ```sh
   npm start
   ```
4. **API is available at** `http://localhost:5000/`.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
