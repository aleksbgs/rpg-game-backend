RPG Game Backend

Overview

This is a backend system for an RPG game, built using a microservices architecture. The backend consists of multiple services, each responsible for different functionalities within the game.

Technologies Used

TypeScript (for backend services)

Node.js (runtime environment)

PostgreSQL (database)

Redis (caching and pub/sub mechanism)

Docker & Docker Compose (containerization and orchestration)

Express.js (backend framework)

Microservices

The backend consists of the following microservices:

1. Account Service working on port 3001

Manages user accounts and authentication.

 
2. Character Service working on port 3002

 Handles character creation and management.

3. Combat Service working on port 3003

Manages battle mechanics between characters.

 

Installation & Setup

Prerequisites

Install Docker and Docker Compose

Install Node.js (if running services locally)
