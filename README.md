# NASA AEROQUEST: Integrated Space Mission Design & Simulation Game
**NASA Systems Engineering & Mission Design Lab (MDL) Challenge**

NASA AEROQUEST is an interactive, browser-based space mission design and simulation game that allows students and aspiring aerospace engineers to experience the full lifecycle of designing, managing, and simulating a space mission from concept to operation.

---

## 🚀 Live Demo & Quick Start

The app is currently running live on your machine!

### To view it:
Open your browser and navigate to:
**[http://localhost:5173/](http://localhost:5173/)** (or `http://127.0.0.1:5173/`)

### To run locally anytime:
```bash
npm install
npm run dev
```

### To build for production:
```bash
npm run build
npm run preview
```

---

## 🌟 Key Highlights & NASA Challenge Alignment

1. **Concept Maturity Level (CML 1 - 4) Framework**:
   - Progressive systems engineering gates inspired by NASA Jet Propulsion Laboratory (JPL) & NASA Mission Design Lab (MDL).
   - **CML 1**: Mission Formulation & Primary Science Questions.
   - **CML 2**: Payload Selection & Scientific Compatibility.
   - **CML 3**: Multidisciplinary Trade Studies (Mass, Power, Propulsion, Comms, Launch Vehicle).
   - **CML 4**: Point Design & Launch Readiness Review (LRR) Go/No-Go Certification.

2. **The 4 Core Mission Segments**:
   - **Space Segment**: Chassis bus structures (CubeSat, SmallSat ESPA, Medium Class, Flagship), solar wings vs Plutonium RTG, Li-Ion batteries, ADCS pointing reaction wheels, and in-space propulsion.
   - **Launch Segment**: Real payload mass-to-orbit curves for Electron, Falcon 9, Falcon Heavy, SLS Block 1, and SmallSat rideshare plates, enforcing NASA's **20% Mass Growth Allowance (MGA)** rule.
   - **Ground Segment**: Deep Space Network (DSN) $34\text{m}$ & $70\text{m}$ tracking antennas (Goldstone, Madrid, Canberra) and Near Space Network (NSN).
   - **User Segment**: Science data downlink, solid-state recorder buffers, and planetary research yield.

3. **4-Player Collaborative Team or Solo Mode**:
   - **Mission Director (MD)**: System budget cap ($M), 15% contingency reserves, schedule, and final LRR signoff.
   - **Payload & Science Lead (PSL)**: Scientific instrument selection and scientific objectives alignment.
   - **Spacecraft Bus & Power Engineer (SBSE)**: Mass margins, solar vs RTG power, eclipse battery DoD, thermal, and propulsion.
   - **Trajectory & Communications Officer (TCO)**: Orbit selection, Tsiolkovsky delta-v, booster matching, and DSN link budget.

4. **Interactive 3D Visualizers (Three.js WebGL)**:
   - **Spacecraft 3D CAD View**: Procedurally updates based on selected components (solar wings unfold, RTG attaches, parabolic dish or laser terminal equips, instruments mount) with an **"EXPLODE CAD"** disassembly mode.
   - **Celestial Flight Dynamics View**: 3D globe (Earth, Moon, Mars, Jupiter/Europa) with orbital ellipses, day/night shadow terminator, and live ground station communication beam pulses.

5. **Live Flight ConOps & Dynamic Anomaly Simulator**:
   - T-minus countdown sequence with audio and liftoff staging.
   - Live telemetry: battery State of Charge dipping in shadow, solar generation, data accumulation, propellant mass.
   - In-flight dynamic events with tactical trade-offs (e.g., Solar Particle Storms, unexpected cryic plumes).

6. **Comprehensive NASA Post-Mission Evaluation & Benchmark**:
   - Systems Engineering Letter Grade (A+, A, B, C, F) and 1000-point index.
   - Direct comparison against real historic NASA missions (LRO, Europa Clipper, PACE, JWST, MRO).
   - Printable & exportable NASA Mission Concept Report.

---

## 📹 Video Demo Walkthrough Script (2.5 Minutes)

1. **0:00 - 0:30 | Mission Setup & Briefing**: Show the home screen at `http://localhost:5173/`, explain the mission design trade-off challenge, and select the **Artemis Lunar South Pole Ice Prospector** in **4-Player Team Mode**.
2. **0:30 - 1:15 | 3D CAD & Trade Studies**: Demonstrate the **3D Spacecraft CAD viewer**, click **"EXPLODE CAD"**, and adjust instrument and power configurations while highlighting the real-time mass, power, and cost margins.
3. **1:15 - 1:45 | Launch Readiness Review (LRR)**: Open the **Systems Review** tab, inspect the 5-pillar trade-off matrix, and conduct the role sign-off poll until all 4 seats vote **GO**.
4. **1:45 - 2:20 | Launch & Orbit Simulation**: Click **"Start Mission Launch & ConOps Simulation"**, watch the T-minus countdown and liftoff, monitor orbital telemetry, and resolve an in-flight anomaly.
5. **2:20 - 2:40 | NASA Evaluation & Debrief**: Review the final grade, score breakdown, and comparison against NASA's real LRO mission.
