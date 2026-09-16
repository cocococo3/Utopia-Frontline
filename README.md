# Utopia-Frontline

> A Twine interactive fiction game set in an underground facility inhabited by humans, humanoid robots, and bio-engineered beings.

## About

**Utopia-Frontline** is a choice-driven interactive fiction game developed with **Twine** in **SugarCube**.

The game takes place in a vast underground management facility that supports the human civilization living on the surface. The facility is responsible for maintaining energy, food, repairs, security, and other essential systems.

You play as a humanoid being with both a **human brain component and an artificial processor**. As you explore the facility, your choices affect not only your relationships with other characters, but also the stability of the entire management system.

The game focuses on:

* Exploration of an enclosed underground world
* Character interaction and relationship development
* Resource and system management
* Branching choices and consequences
* Sci-fi worldbuilding
* Psychological and interpersonal storytelling

## Features

### Exploration

The underground facility is divided into multiple departments, each with its own functions, inhabitants, and atmosphere.

Current / planned areas include:

* Maintenance Department
* Food Department
* Security Department
* Prison / Containment Area
* Power and Energy Systems
* Surface-world connections

### Game Systems

The game uses SugarCube variables to track the player's condition and the state of the facility.

Example variables include:

```text
power       → Facility power level
woreout     → Player's accumulated wear
chaos       → Overall system instability
decayRate   → System deterioration rate
money       → Player's resources
defence     → Facility defense level
```

The player also has basic character attributes such as:

```text
HP
ATK
Skills
Position
Time
```

Time advances as the player performs different actions, allowing events and character interactions to change depending on the current time.

### Characters

The underground facility is inhabited by a variety of humanoid and bio-engineered characters.

Each character has their own personality, role, relationships, and potential interactions with the player.

## Technology

The project is built with:

* **Twine**
* **SugarCube**
* HTML
* CSS
* JavaScript

The project aims to keep its JavaScript relatively lightweight and maintainable, with particular attention to compatibility with **mobile browsers**.

## Project Structure

A simplified structure of the project looks like:

```text
/
├── README.md
├── game/
│   ├── story.html
│   ├── css/
│   └── js/
├── assets/
│   ├── images/
│   └── audio/
└── docs/
```

The exact structure may change during development.

## Development Status

**Status: In Development**

The current version is a prototype / work in progress.

## Design Goals

The project is designed around the idea of making a relatively small-scale interactive fiction game feel like a **living facility**.

Rather than presenting the underground world only through exposition, the game attempts to communicate its setting through:

* Environmental descriptions
* Character behavior
* Resource changes
* Time progression
* Small interactive events
* Repeated interactions with NPCs
* Consequences of player decisions

The goal is to gradually reveal the structure and history of the underground facility through exploration and interaction.

## License

This project is currently a personal / educational project.

Unless otherwise stated, the game's original writing, characters, artwork, and other creative assets are **not licensed for redistribution or commercial use**.

Third-party libraries and assets remain subject to their respective licenses.
