-- ═══════════════════════════════════════════════════════════════
-- CampusFlow — Facility Seed
-- Run: wrangler d1 execute campusflow-db --file=./seed.sql --remote
-- ═══════════════════════════════════════════════════════════════

DELETE FROM facilities;

INSERT INTO facilities (id, code, name, category, kind, capacity, location, open_hours, status, description, contact, equipment) VALUES

-- ═══════════ COMPUTING & AI ═══════════
(1, 'C-01', 'Data Centre', 'computing_ai', 'lab', 10, 'Block D · L0', '24x7', 'open',
 'Cloud Computing platform with Blade Servers, Storage Servers, Firewall and Manageable Switches. Multiple Dedicated Leased line access with internet-bandwidth of 280 Mbps and 20 VPN dedicated lines.',
 NULL,
 '["CPU Clusters"]'),

(23, 'C-02', 'Intelligent Electronics System Laboratory', 'computing_ai', 'lab', 25, 'Block C · L1', '08:00-20:00', 'open',
 'An advanced IoT and AI research hub equipped with smart sensors, embedded systems, and computing platforms for developing intelligent connected devices.',
 'Peeyush K. P. · Assistant Professor (Sr. Gr), ECE · kp_peeyush@cb.amrita.edu',
 '["Displacement Measurement Trainer Using LVDT","Load Cell Trainer Module","30 MHz Dual Channel Analog Oscilloscope","Multi Variable Trainer","Micro Controller Based PWM Controller & Power Module with Graphic Display","ac Servo Motor with Mechanical Set up","dc Servo Motor with Mechanical Set up","Creality Ender 5 Plus 3D Printer","Raspberry Pi 4 – 8 GB RAM Complete Kit","NVIDIA Jetson Nano 4 GB Development Kit","LoRa Shield for Arduino","Multi Channel LoRa Indoor Gateway","Leap Motion Controller with SDK","FLIR Thermal Imaging Camera for Smart Phones","HTC SMPS 3005 Power Supply 0-30 V 0-5 A","Aoyue 866 SMD Digital Hot Rework Station","Raspberry Pi HI Quality Camera with Interchangable Lens","6mm Wide Angle Lens for Raspberry Pi High Quality Camera","Arduino Boards","Xbee Modules","ESP Boards","Sensor Modules","WDM IoT Module","Amazon Echo Dot 4th Gen","Google Home Mini","Tello Mini Drone","Quad Coptor Kit with APM 2.8"]'),

(26, 'C-03', 'Bio-Signals Processing & Rehabilitation Robotics (BSRR) Lab', 'computing_ai', 'lab', 25, 'Block C · L2', '08:00-20:00', 'open',
 'An interdisciplinary research lab focused on biosignal processing and rehabilitation robotics to develop innovative healthcare and rehabilitation technologies.',
 'Dr. Akhil V. M. · Assistant Professor (Sr. Gd), School of AI · vm_akhil@cb.amrita.edu · Dr. Amrutha Veluppal · v_amrutha1@cb.amrita.edu',
 '["EMG and ECG wireless and Wired Equipment","EEG: Emotiv EPOC X","Cardio Sensors: Pulse oximeter, PPG, BP Sensor, Cardio Mic","Respiratory: Spirometer (SP-304)","Neuro/Muscle: Dynamometer, Reflex Hammer, Temp Sensor","Physiology Kit: iWorx BK-214 / IX-214","Data Systems: IX-RA-834, IX-214","Electrodes: Disposable","Software: LabScribe"]'),

(27, 'C-04', 'Amrita Mobile Ubiquitous & Distributed Applications Lab (AMUDA Lab)', 'computing_ai', 'lab', 25, 'Block C · L3', '08:00-20:00', 'open',
 'AMUDA Lab has been set up to enable multidisciplinary research focusing on building large-scale cyber-physical systems for the design of sustainable intelligent buildings, providing timely healthcare, and enhancing the use of technology in agriculture.',
 'Dr. J. Govindarajan · Assistant Professor (Sl. Gd.), School of Computing · j_govindarajan@cb.amrita.edu · Dr. S. Vishnu · s_vishnu1@cb.amrita.edu',
 '["A Cyber-Physical System for Leak Detection in Water Distribution Networks","Cooperative Algorithms and Frameworks for Pervasive Systems","Ambient Intelligent Frameworks for Event Detection in Indoor Spaces","Lakshya: A Framework for Diversion Detection and Mitigation","Frameworks and Solutions for Digital Addiction","Calibration Free Indoor Localization Systems","Statistical Semantic Networks for Concept and Document Relatedness"]'),

(29, 'C-05', 'SiGMA – Signal Processing, Machine Learning and Artificial Intelligence Research Lab', 'computing_ai', 'lab', 25, 'Block C · L3', '08:00-20:00', 'open',
 'SiGMA Lab is a research laboratory in the Department of Computer Science and Engineering that promotes research on Signal Processing, GPU Computing and Mobile Applications.',
 'Dr. Rajathilagam B. · Principal, School of Computing · b_rajathilagam@cb.amrita.edu',
 '["Workstation with 2 NVIDIA V100 GPUs","Dell Desktop i7 – NVIDIA K40 GPU","Visualization – 4K monitors, 3D TV","NVIDIA Jetson","Google Home","Amazon Echo Dot","Smart Robo Car Kit","Raspberry Pi Boards","Humanoid Biped Robot","DJI Tello Drone","Arduino Board"]'),

(35, 'C-06', 'CISCO Networking Academy', 'computing_ai', 'lab', 30, 'Block D · L1', '08:00-20:00', 'open',
 'A regional training centre offering networking education, technical certifications, and instructor training through Cisco NetAcad program.',
 NULL,
 '["Cisco Certified Network Associate (CCNA)","CISCO Certified Network Professional (CCNP)","IT Essentials: PC Hardware and Software","DevNet Associate","Experimenting with REST APIs using Webex Teams","Network Programmability with Cisco APIC-EM","Model-Driven Programmability","IoT Fundamentals: Connecting Things","IoT Fundamentals: IoT Security"]'),

(43, 'C-07', 'AI & Robotics Lab', 'computing_ai', 'lab', 30, 'Block D · L2', '08:00-20:00', 'open',
 'Serves as a foundational computational and testing space for autonomous system tracks at Ettimadai.',
 NULL,
 '["6-DOF Robotic Manipulators","Bioloid Premium Humanoid Kits","FPGA Edge AI Workstations","Spatial Autonomy Workbenches","EMG Muscle-Sensor Arrays"]'),

(46, 'C-08', 'Cyber Security Lab', 'computing_ai', 'lab', 30, 'Block D · L2', '08:00-20:00', 'open',
 'Studies cryptography, security analysis, and techniques for protecting computer systems and data.',
 NULL,
 '["GPU Clusters, Packet & Traffic Generators","Secure Routers","FPGA Validation Boards"]'),

-- ═══════════ ELECTRONICS ═══════════
(2, 'E-01', 'Communication Engineering Laboratory', 'electronics', 'lab', 30, 'Block A · L1', '08:00-20:00', 'open',
 'Students conduct experiments of different types of modulation and demodulation techniques and enhance their knowledge and understanding in the area of analog and digital communication systems.',
 'Sudheesh P. · Assistant Professor (S.G), ECE · p_sudheesh@cb.amrita.edu',
 '["70 MHz Digital Storage Oscilloscope","100 MHz Digital Storage Oscilloscope","50 MHz Digital Storage Oscilloscope with built-in 20 MHz Function Generator & Digital Voltmeter","30 MHz Cathode Ray Oscilloscope","3 MHz Function Generator","25 MHz Arbitrary Function Generator","Regulated Power Supply (0-30 V / 2 A)","Regulated Variable Dual Power Supply (0-30 V / 2 A)","Digital Multimeter – 3½ Digit","True RMS Digital Multimeter – 3½ Digit","Digital Voltmeter (dc 0-2 / 20 / 200 V)","Digital Milli Ammeter (dc 0-2 / 20 / 200 mA)","Digital Micro Ammeter (dc 0-2 / 20 / 200 µA)","USRP X300 Kit, Daughter Boards and Vertical Antennas","RTL–SDR Blog R820T2 RTL2832U 1PPM TCXO SMA Software Defined Radio with 2X Telescopic Antennas","ADALM-PLUTO 584 – SDR & RF Development Kit","ARDUINO UNO Compatible RG UNO ATMEGA 328","Raspberry Pi 3 – Starter Kit","NetSim Standard Version V13 with C1 to C11 Tool Boxes","NetSim Academic Version V13.1"]'),

(8, 'E-02', 'Digital Design Laboratory', 'electronics', 'lab', 40, 'Block A · L2', '08:00-20:00', 'open',
 'This lab is used to get familiarized with various ICs and utilize them in the implementation of digital circuits.',
 'Dr. J. Aravinth · Associate Professor & Vice Chairperson, ECE · j_aravinth@cb.amrita.edu',
 '["Digital IC Trainer Kit – 4 Bit","Digital IC Trainer Kit – 10 Bit","Digital IC Trainer Kit – 12 Bit","Digital IC Tester","Linear IC Tester","Regulated Power Supply (0 – 30 V / 2 A)","Regulated Power Supply (0-2 V / 2 A)","Regulated Variable Dual Power Supply (0-30 V / 2 A)","Analog Voltmeters","Analog Ammeters","Digital Voltmeter (dc 0-2 / 20 / 200 V)","Digital Ammeter (dc 0-2 / 20 / 200 mA)","Digital Micro Ammeter (dc 0-2 / 20 / 200 µA)","Digital Multimeter – 3½ Digit","30 MHz Cathode Ray Oscilloscope","50 MHz Digital Storage Oscilloscope","50 MHz Digital Storage Oscilloscope with built-in 20 MHz Function Generator & Digital Voltmeter","3 MHz Function Generator","Resistance Box 5 Dials"]'),

(13, 'E-03', 'Microwave & Antenna Laboratory', 'electronics', 'lab', 30, 'Block B · L1', '08:00-20:00', 'open',
 'Gives students hands-on experience with microwave wave propagation, antennas, and RF systems.',
 'Dr. Natarajamani S. · Assistant Professor (SG), ECE · s_natarajamani@cb.amrita.edu',
 '["RF Shielded Anechoic Chamber, 4.8m(L) × 3m(W) × 3m(H), 800 MHz to 40 GHz","RF Shielded Anechoic Chamber with Automatic Three Axis Antenna Positioning System","Standard Gain Ridge Antenna (800 – 18 GHz)","Standard Gain Horn Antenna (18 – 26 GHz)","Standard Gain Horn Antenna (26 – 40 GHz)","Vector Network Analyzer (1 MHz to 20 GHz)","Desktop Computer for VNA: OptiPlex 5090, 11th Gen i5 @ 2.7 GHz, 8 GB RAM","Standard Gain Horn (X band)","Pick up Horn (X band)","Slotted Wave Guide Antenna (X band): Narrow wall","Slotted Wave Guide Antenna (X band): Broad wall","Dielectric Antenna (X band)","H–Sectorial Horn (X band), Solid State Klystron Power Supply","Klystron Mount with Klystron Tube","Solid Dielectric Cell","Liquid Dielectric Cell","Phase Shifter","Fixed Attenuator","Magic Tee","Precision Short","Frequency Meter","Variable Attenuator","Slotted Sections","Tunable Probe","Detector Mount","Movable Short","Matched Termination","VSWR Meter","S S Tuner","Circulator","Directional Coupler","Wave Guide Adaptor","Wave Guide Piece","PIN Modulator","E & H–Plane Bend","90 Degree Twist","E & H–Plane Tee","30 MHz Cathode Ray Oscilloscope","50 MHz Digital Storage Oscilloscope","60 MHz Digital Storage Oscilloscope","100 MHz Digital Storage Oscilloscope","3 MHz & 10 MHz Function Generator","RF Generator – Detector 3 GHz","PSM3120 USB Power Meter True Average 10 MHz – 8 GHz: N-Type Male","RF Signal Generator with USB Interface: 34.5 MHz to 4400 MHz, Output Power -30 dBm to 0 dBm"]'),

(14, 'E-04', 'Microprocessor Laboratory', 'electronics', 'lab', 40, 'Block A · L3', '08:00-20:00', 'open',
 'For getting familiarized with Microprocessor and Microcontroller Development Kits.',
 'Dr. Adarsh S. · Assistant Professor (S.G), ECE · s_adarsh@cb.amrita.edu',
 '["ARM LPC2148 Development Kit","PIC16F877A Development Kit","8085 Microprocessor Kit","Proteus 8 Professional Software (Simulator)"]'),

(15, 'E-05', 'Electronics Hardware Laboratory', 'electronics', 'lab', 40, 'Block A · L1', '08:00-20:00', 'open',
 'Basic experiments that help the students understand the working and application of simple electronic circuits are conducted here (1st year).',
 'Dr. Anusha K. S. · Assistant Professor (SG), ECE · ks_anusha@cb.amrita.edu',
 '["30 MHz Cathode Ray Oscilloscope","50 MHz Digital Storage Oscilloscope with built-in 20 MHz Function Generator & Digital Voltmeter","3 MHz Function Generator","Regulated Power Supply (0-30 V / 2 A)","Regulated Variable Dual Power Supply (0-30 V / 2 A)","PSD 3003 Power Supply, 3A","Digital Voltmeter (dc 0-2 / 20 / 200 V)","Digital Milli Ammeter (dc 0-2 / 20 / 200 mA)","Digital Multimeter – 3½ Digit","Temperature Controlled Soldering Station","Bench Vice","Drilling Machine","Rework System (Soldering & Desoldering) SMD Hot Air","PCB Prototype Making Machine with Solder Masking Unit (Milling type)"]'),

(16, 'E-06', 'Electronic Circuit Laboratory', 'electronics', 'lab', 40, 'Block A · L2', '08:00-20:00', 'open',
 'The laboratory has basic electronic experiments on analog and digital circuits.',
 'Vidya L · Assistant Professor (Sr. Gr.), ECE · l_vidhya@cb.amrita.edu',
 '["50 MHz Digital Storage Oscilloscope with built-in 20 MHz Function Generator & Digital Voltmeter","70 MHz Digital Storage Oscilloscope","60 MHz Digital Storage Oscilloscope","30 MHz Cathode Ray Oscilloscope","3 MHz Function Generator","Regulated Power Supply (0-32 V / 2 A)","Regulated Variable Dual Power Supply (0-30 V / 2 A)","Regulated Power Supply (0-2 V / 2 A)","Analog Voltmeter","Analog Ammeter","Digital Voltmeter (dc 0-2 / 20 / 200 V)","Digital Milli Ammeter (dc 0-2 / 20 / 200 mA)","Digital IC Trainer Kit","Digital IC Tester","Linear IC Tester","LCR–Q meter","Raspberry Pi with 8 GB RAM","Analog Discovery Kit","Data Acquisition Board","DAC with Counter"]'),

(17, 'E-07', 'Digital Signal Processing Laboratory', 'electronics', 'lab', 40, 'Block B · L2', '08:00-20:00', 'open',
 'Experimental activities cover fundamental concepts of digital signal processing such as sampling and aliasing, quantization, digital filter design and implementation.',
 'Dr. Aravinth J. · Vice Chairperson, ECE · j_aravinth@cb.amrita.edu',
 '["Xilinx Zynq–7000 SOC Video and Imaging Kit","ATLYS – Spartan 6 Design Platform","ANVYL – Spartan 6 Development Kit","Nexys 3 – Spartan 6 FPGA Board","Analog Discovery Kit","Matlab Full Suite – Academic License","Xilinx Vivado ML Enterprise Edition with VITIS Model Composer","Personal Computers"]'),

(18, 'E-08', 'VLSI Design – UG Laboratory', 'electronics', 'lab', 40, 'Block B · L2', '08:00-20:00', 'open',
 'The VLSI Design lab is equipped with the most up-to-date industry standard VLSI EDA software tools and hardware resources.',
 'Dr. Navya Mohan · Assistant Professor (SG), ECE · m_navya@cb.amrita.edu',
 '["Keysight MSOX3014A 100 MHz 4 Channel Mixed Signal Oscilloscope","Anvyl Spartan 6 FPGA Board","Analog Discovery Kit","Virtex-6 FPGA ML605 Evaluation Kit","Zybo Zynq-7000 Development Board","FMC–CE I/O Card","FPAA Quad Development Kit (AN231K04 – QUAD4)","Digital Multimeter with U1177A IR-to-Bluetooth","Digital Discovery Portable Logic Analyzer and Digital Pattern Generator with High speed Adapter","Zed Board Zynq-7000","Zybo Z7-10, Zynq-7000 ARM/FPGA SoC Development Board","Digital Multimeter – 3½ Digit","Arty S7 (Spartan-7) FPGA","Basys 3 Entry Level FPGA","Arty Z7-20 All Programmable System-on-Chip (APSoC)","LabView with Signal Express","Matlab Full Suite – Academic License"]'),

(20, 'E-09', 'Embedded Computing Laboratory', 'electronics', 'lab', 40, 'Block A · L3', '08:00-20:00', 'open',
 'For getting familiarized with Microprocessor and Microcontroller Development Kits.',
 'Dr. Rolant Gini J. · Assistant Professor (S.G), ECE · j_rolantgini@cb.amrita.edu',
 '["8085 Microprocessor Trainer Kit","PIC Programmer","PIC Development Board","Regulated Power Supply (0-30 V / 2 A)","30 MHz Dual Channel Analog Oscilloscope","ARM 7 LPC 2148 (Microcontroller) Development Board","Raspberry Pi 4 with 8 GB RAM – Complete Kit","Raspberry Pi Sense Hat","dc Stepper motor HAT for Raspberry Pi","STM 32F446 RE Nucleo-64","MSP432 P401R MCU LaunchPad Eval Module","EK-TM4C123GXL – ARM TIVA Launch Pad","Proteus VSM Simulator Software","Personal Computers"]'),

(36, 'E-10', 'VLSI Design – PG Laboratory', 'electronics', 'lab', 30, 'Block B · L3', '08:00-20:00', 'open',
 'An advanced facility equipped with FPGA boards, ASIC design tools, oscilloscopes, and computing systems for semiconductor design and hardware prototyping.',
 'Mohankumar N. · Assistant Professor (Sr. Gr), ECE · n_mohankumar@cb.amrita.edu',
 '["Keysight Mixed Domain Oscilloscope","Xilinx ZYNQ Ultrascale+ MP SoC ZCU104 Evaluation kit","National Instruments myRIO-1900 with Wi-Fi and MSP Connect","Basys-3 Artix-7 FPGA Trainer Board","PYNQ Z1: Python Productivity for ZYNQ 7000 ARM/FPGA SoC","Synopsys Bundle","Xilinx Vivado","Xilinx SDSoC","Cadence Design suite","Tie-up with TSMC","Ansys HFSS"]'),

(37, 'E-11', 'Wireless System Design Laboratory', 'electronics', 'lab', 25, 'Block B · L1', '08:00-20:00', 'open',
 'An advanced research facility focused on RF hardware design, 5G communications, antenna systems, wireless networks, and IoT technologies.',
 'Dr. Kirthiga S. · Associate Professor, ECE · s_krithiga@cb.amrita.edu',
 '["USRP N210 Kit","LFTX USRP Daughter Board (DC – 30 MHz)","LFRX USRP Daughter Board (DC – 30 MHz)","BASICTX USRP Daughter Board (1 – 250 MHz)","BASICRX USRP Daughter Board (1 – 250 MHz)","DBSRX2 USRP Daughter Board (250 MHz – 2.3 GHz)","WBX USRP Daughter Board (50 MHz – 2.2 GHz)","CBX USRP Daughter Board (1.2 – 6 GHz)","XCVR2450 USRP1 Daughter Board (2.4 – 2.5 GHz, 4.9 – 5.9 GHz)","Cable Assembly, USRP MIMO Data And Sync Cable, 0.5 M","LP0965 LOG PERIODIC PCB Antenna (900 MHz – 2.6 GHz)","VERT900 Vertical Antenna (824 – 960 MHz and 1710 – 1990 MHz)","VERT2450 Vertical Antenna (2.4 – 2.5 GHz and 4.9 – 5.9 GHz)","Analog Discovery 2 – 410-321","Mixed Domain Oscilloscope – MDO4024C","Ansys Academic Teaching HF Package","ANSYS Academic Multiphysics Campus Solution – Teaching","ANSYS Academic Multiphysics Campus Solution – Research","Matlab Full Suite – Academic License"]'),

(38, 'E-12', 'Bio-Medical Instrumentation Laboratory', 'electronics', 'lab', 30, 'Block C · L2', '08:00-20:00', 'open',
 'Various equipment and software tools for the design and analysis of analog circuits.',
 'Dr. Madhu Mohan N. · Associate Professor, ECE · n_madhumohan@cb.amrita.edu',
 '["50 MHz Digital Storage Oscilloscope with built-in 20 MHz Function Generator & Digital Voltmeter","70 MHz / 100 MHz Digital Storage Oscilloscope","250 KHz Analog Bandwidth & PC Based Digital Storage Oscilloscope","30 MHz Dual Channel Analog Oscilloscope","10 MHz Synthesised Function Generator","3 MHz Function Generator","Regulated Variable Dual Power Supply (0-30 V / 2 A)","Digital Multimeter – 3½ Digit","Digital Multimeter – 4 Digit","Digital Multimeter with Software (USB adaptor)","Digital Multimeter – 6½ Digit","Analog Meters","Opto–Mechatronics","ECG Simulator Trainer","EEG Simulator Trainer","CY3210-PSOC EVa11 Electronic Components Sample Kits","Spectrometer LASER Exp","Digital Polarimeter","Colorimeter with in-built 8 Filter Disc Mounted","Filter Set EQ 650","USB Data Acquisition Device","Rework System (Soldering & Desoldering) SMD Hot Air","Smart Tweezer","CMC DAQ Data Recording System For Physiology"]'),

-- ═══════════ ENERGY ═══════════
(19, 'N-01', 'Solar Energy & Optoelectronics Laboratory', 'energy', 'lab', 25, 'Block E · L2', '08:00-20:00', 'open',
 'Instruments for material synthesis, thermal processing, chemical analysis, thin-film coating, solar cell testing, and UV characterization.',
 NULL,
 '["Muffle furnace","Servo hot air oven","Teflon lined acid digestion bomb with accessories","Rotary evaporator with accessories","FD12 – Two stage oil sealed, rotary vane vacuum pump with single phase motor, 220V±10%, 50 Hz","Spin Coater","Ultrasonicator","Magnetic Stirrer with ceramic hot plate","Solar Cell Current Voltage Test Station","UV with DRS UV Chamber","Screen Printer","IPCE Instrument"]'),

(24, 'N-02', 'Renewable Energy Lab', 'energy', 'lab', 25, 'Block E · L2', '08:00-20:00', 'open',
 'Focuses on sustainable power systems, smart grids, microgrids, solar and wind energy integration, and electric vehicle technologies.',
 'Dr. Umashankar Subramaniam · Professor, EEE · s_umashankar@cb.amrita.edu',
 '["Wind Turbine (300W)","Fuel cell (20W)","Photo Voltaic Panels (68 × 8 = 544W)","Grid tied inverter","Permanent Magnet Synchronous Generator (500W)","3 Phase Induction Motor (1.1 kW)","DC Shunt Motor (1.1 kW)","1 kVA Alternator coupled with 1.5 kW DC motor and tachometer","DC Rectifier (30A)","SEMIKRON Inverters (Inverter + Inverter)","SEMIKRON Inverters (Rectifier + Inverter)","Altium Nano Board 3000","Xillinx SPARTAN 3AN","Altium Designer","Digital storage oscilloscope 4 channel","Digital storage oscilloscope 2 channel"]'),

(25, 'N-03', 'Waste-to-Energy Laboratory', 'energy', 'lab', 20, 'Block E · L3', '08:00-20:00', 'open',
 'Uses customized batch pyrolysis reactors (400–1200°C), muffle furnaces, magnetic stirrers, and distillation setups.',
 'Dr. Akhil Mohan · Assistant Professor, CEN · m_akhil1@cb.amrita.edu',
 '["Batch pyrolysis reactor for pyrolytic liquefaction of waste materials (Customized)","Magnetic stirrer for mixing liquid solutions","Weighing balance for measurements","Muffle furnace for heating adsorbents","Fabrication of batch-scale pyrolysis system","Distillation set up for refining of crude tire pyrolysis oil to clean fuels","Lathe machine for utilization of lubricants or fuels"]'),

(28, 'N-04', 'Energy Materials & Devices Laboratory', 'energy', 'lab', 20, 'Block E · L1', '08:00-20:00', 'open',
 'Focuses on developing and testing energy materials, electrochemical systems, batteries, and solar-energy-related devices.',
 NULL,
 '["Ball Mill","Auto Lab [Electrochemistry Work Station]","Electrochemical Workstations – BIOLOGIC","Electrochemical Workstations – Origaflex-Origalys","10500, Class A Solar Simulator (Make: Abet Technologies Inc.)","Probe Sonicator with accessories","Magnetic stirrer with ceramic hot plate","Electrochemical Cells [5 Nos]","Compact Nano Fiber Electrospinning Unit","Arc Melting Furnace","PCT PRO","Vacuum Furnace","Glove Box","Fume Hood"]'),

(30, 'N-05', 'Energy Systems & Process Intensification Laboratory', 'energy', 'lab', 20, 'Block E · L3', '08:00-20:00', 'open',
 'Supports research in energy systems, heat transfer, chemical processes, and process optimisation.',
 NULL,
 '["Gas Chromatograph with TCD and FID detectors","Heat Transfer Test Rig","CNC router","Three zone tubular furnace","Holmarc Syringe pump","Gas mass flow controllers","Peristaltic pumps","Dip coating unit"]'),

-- ═══════════ CHEMICAL ═══════════
(22, 'CH-01', 'Central Instrumentation Facility', 'chemical', 'lab', 20, 'Block F · L0', '08:00-20:00', 'open',
 'Provides advanced instruments for material characterisation, thermal analysis, chemical analysis, and structural and surface studies.',
 NULL,
 '["Thermal Analysis Facility [Differential Scanning Calorimeter – DSC, Thermogravimetry – Differential Thermal Analyzer – TG-DTA]","Fourier Transform Infrared Spectrometer","XRD facility (Powder, thin film, SAXS)","Shimadzu gas chromatograph mass spectrometer, model: Qp 2010 Ultra EI/PCI with accessories","Field Emission Scanning Electron Microscope (FESEM)","Ion Chromatograph (IC)","Inductively Coupled Plasma Optical Emission Spectroscopy (ICP-OES)","BET Surface Analyzer and Chemisorption","Ultraviolet Visible with Diffuse Reflectance Spectroscopy (UV-DRS)"]'),

(31, 'CH-02', 'Center of Excellence in Advanced Materials and Green Technologies (CoE-AMGT)', 'chemical', 'lab', 20, 'Block F · L1', '08:00-20:00', 'open',
 'Core cleanroom infrastructure housing advanced materials analysis devices like SEM and X-ray diffraction machines.',
 'Dr. Balakrishnan Shankar · Dean, School of Engineering, Amritapuri · bala@am.amrita.edu',
 '["Conversion of Mixed Food and Plastic Waste to Liquid Fuels through Synthesis Gas using a Microchannel Reactor","Design and Synthesis of Peptide Nucleic Acids (PNA, Artificial DNA) Having Markers for Easy Recognition of PNA-DNA Binding","Large Magnetoresistance Electrodeposited Bismuth Films for Low Magnetic Field Sensing","Development of Ultra High Temperature Resistance Polymeric Nano Composite for Long Distance Space Applications","Durability of High Performance Nano Adhesive Bonding of Aluminium under Aerospace Environments"]'),

(32, 'CH-03', 'Advanced Functional Materials Laboratory', 'chemical', 'lab', 20, 'Block F · L1', '08:00-20:00', 'open',
 'Enables the synthesis, processing, and electrochemical characterisation of advanced functional materials.',
 NULL,
 '["Pulse Power Supply","Bain cut Diamond Saw","Ultrapure Water Facility","Metallurgical Microscope","pH Meter","Muffle Furnace","Centrifuge","Rotating Disk Electrode Setup with Potentiostat/Galvanostat (WaveNow)","Electrochemical Workstation with Impedance Analyzer (CHI604E)","Vacuum Furnace"]'),

(33, 'CH-04', 'Nanomaterials Laboratory', 'chemical', 'lab', 20, 'Block F · L2', '08:00-20:00', 'open',
 'Supports nanomaterial synthesis, thin-film deposition, optical characterisation, and electrical property measurements.',
 NULL,
 '["Hot Air Oven","Syringe Pump Nanovoltmeter with DC Power Supply","Micro Milli Ohm Meter","Centrifuge Make: REMI, Model-R8C with 8×15 ml Rotor heads","All glass double distillation unit 3362-4.0L, DAPS-1.5L (Power supply) BOROSIL","FD12 – Two stage oil sealed, rotary vane vacuum pump with single phase motor, 220V±10%, 50 Hz","Magnetic stirrer with hot plate","Keithley 2450 Source Meter","Tubular Two Zone Furnace","Vacuum Coating Unit Thermal Evaporator","Photoluminescence SHIMADZU","Solar Simulator","Keysight Source Meter","Spin Coater"]'),

(34, 'CH-05', 'Chemical Reaction Engineering Lab', 'chemical', 'lab', 25, 'Block H · L1', '08:00-20:00', 'open',
 'Designed for assessing reactant properties, batch reactor dynamics, and safe distillation setups.',
 NULL,
 '["Continuous Stirred Tank Reactor (CSTR)","Plug Flow Reactor (PFR)","Semi-Batch & Isothermal Batch Reactors","Reactors in Series Setup","Residence Time Distribution (RTD) Stations"]'),

-- ═══════════ INNOVATION ═══════════
(7, 'I-01', 'Additive Manufacturing Lab', 'innovation', 'lab', 25, 'Block G · L1', '08:00-22:00', 'open',
 'Dedicated to advanced 3D printing, plastics engineering, and building component prototypes.',
 'Dr. Prashanth B. N. · Assistant Professor (Sl. Gd.), Mechanical Engineering · bn_prashanth@blr.amrita.edu',
 '["3D Printing – FDM (Lapwing)","3D Printing – FDM (Olivetti)","3D Printing – SLA (Spaar3D Photon)","3D Printing – SLS (Photon Plus)"]'),

(9, 'I-02', 'AICTE IDEA Lab', 'innovation', 'lab', 40, 'Block G · L1', '08:00-22:00', 'open',
 'A multi-disciplinary makerspace for 3D printing, laser cutting, and electronic circuit board prototyping.',
 'Dr. Sasangan Ramanathan · Chief Mentor/Coordinator · idealab@cb.amrita.edu',
 '["Faculty Development Program (FDP)","Student Skilling Program","Boot Camp (Faculty)","Ideation Workshop","Industry Awareness Workshop","Internship Program","Professional Skilling Program"]'),

(21, 'I-03', 'Amrita-Cognizant Innovation Lab', 'innovation', 'lab', 30, 'Block G · L2', '08:00-20:00', 'open',
 'A collaborative innovation sandbox for enterprise software design and computing projects.',
 'Dr. Baskar A. · Assistant Professor (Sr. Gd.), School of Computing · a_baskar@cb.amrita.edu',
 '["Robotic Kits","Machine Vision system","Beagle & Leopard Board","TP-Link IP","GPU","Kinect","Universal Software Radio Peripheral (USRP)"]'),

(44, 'I-04', 'AIC – Amrita Vishwa Vidyapeetham Foundation (AIC-ACE)', 'innovation', 'lab', 50, 'Block G · L2', '08:00-22:00', 'open',
 'A state-of-the-art startup incubator facility providing plug-and-play coworking blocks, meeting areas, and deep-tech validation space for student-led hardware and software projects.',
 'Dr. Krishnashree Achuthan · Dean of PG Programs, School of Engineering · krishna@amrita.edu',
 '["Centers of Excellence (CoEs)","Facilities for testing Electric Vehicles (EVs)","Biosensors & Electronics","High-performance computing setups for Artificial Intelligence"]'),

-- ═══════════ MECHANICAL ═══════════
(10, 'M-01', 'Amrita Automotive Research & Technology Centre (AARTC)', 'mechanical', 'lab', 30, 'Block H · L0', '08:00-20:00', 'open',
 'Advanced facility for engine emissions diagnostics and alternative vehicle fuel evaluations.',
 'Mr. C. Lakshmikanthan · Assistant Professor (Sr. Gd.), Mechanical Engineering · c_lakshmik@cb.amrita.edu',
 '["Eddy Current Dynamometer (SAJ)","Transient Dynamometer (K & S)","Chassis Dynamometer (Horiba)","Emission Analyser (Horiba)","Emission Analyser (AVL Smart Sampler)","Data Acquisition System (IMC)","Data Acquisition System (Head Lab)"]'),

(11, 'M-02', 'Metal Forming & Engineering Design Lab', 'mechanical', 'lab', 25, 'Block H · L1', '08:00-20:00', 'open',
 'Focuses on computer-aided mechanical component modeling and structural metal testing.',
 'Dr. Arun A. · Assistant Professor (Sl. Gd.), Mechanical Engineering · a_arun@cb.amrita.edu',
 '["Hydraulic Press","Mechanical Press","Cupping Test Apparatus"]'),

(12, 'M-03', 'Polymer Processing / Nanocomposites Laboratory', 'mechanical', 'lab', 25, 'Block H · L1', '08:00-20:00', 'open',
 'Advanced machinery for injection molding, extrusion, compression molding, rubber testing, and cavitation erosion analysis.',
 NULL,
 '["Microprocessor Controlled Fully Automatic Injection Molding Machine (50 T)","Two Roll Mill","Single Screw Segmented Barrel Extruder","Oscillating Disk Rheometer","Twin Screw Extruder with Accessories","Hydraulic Compression Moulding Hot press – 500T","Cavitation erosion set-up from Bandi technology"]'),

(41, 'M-04', 'Engineering Design Lab', 'mechanical', 'lab', 25, 'Block H · L2', '08:00-20:00', 'open',
 'Equipped with creep, fatigue, tribometer, universal testing (UTM), and microhardness machines.',
 'Dr. Saimurugan M. · Associate Professor, Mechanical Engineering · m_saimurugan@cb.amrita.edu',
 '["Computerised Creep Testing Machine","Pin on Disc Tribometer (Ducom)","Vibration & Sound Data Acquisition (DAQ) System"]'),

(45, 'M-05', 'Welding Lab', 'mechanical', 'lab', 25, 'Block H · L2', '08:00-18:00', 'open',
 'Outfitted with Fronius GMAW (Gas Metal Arc Welding), GTAW (Gas Tungsten Arc Welding), and SMAW (Shielded Metal Arc Welding) stations.',
 'Dr. A. Sumesh · Associate Professor, Mechanical Engineering · a_sumesh@cb.amrita.edu · Mr. R. Senthilkumar · r_senthilkumar@cb.amrita.edu',
 '["Fronius GMAW (Gas Metal Arc Welding) Stations","GTAW (Gas Tungsten Arc Welding) Stations","SMAW (Shielded Metal Arc Welding) Stations"]'),

(47, 'M-06', 'Structural and Construction Engineering Laboratory', 'mechanical', 'lab', 25, 'Block H · L3', '08:00-20:00', 'open',
 'The Structural Engineering Group of the Civil Engineering Department focuses on the research and consultancy activities on materials, structures etc.',
 'Dr. Vijayanarayanan A. R. · Assistant Professor (Sr. Gr.), Civil Engineering · ar_vijayanarayanan@cb.amrita.edu',
 '["Single acting cylinder assembly – 25 Tonne & 50 Tonne","Load cell and Indicator","Mechanical Strain Gauge","Data Acquisition System","Shake Table Facility","Digital Multimeter","LCM Foam Generator","Pan Type Motorized Concrete Mixer","Self-Compacting Concrete Testing Apparatus: L-Box, V-Funnel, J-ring, U-Box","Cube & Cylinder Moulds","Hot Press-Guarded Ring Apparatus","Accelerated Curing Tank","Tile Abrasion testing Machine","Concrete Impact tester","Brookfield Viscometer with Rheocalc software"]'),

-- ═══════════ GENERAL ═══════════
(3, 'G-01', 'Repographic Centre', 'general', 'store', 10, 'Admin Block', '09:00-18:00', 'open',
 'DTP, Xerox and graphic design facilities.',
 NULL, '[]'),

(4, 'G-02', 'Visual Media Lab', 'general', 'lab', 20, 'Media Block', '09:00-20:00', 'open',
 'Powerful and state-of-the-art Multimedia workstations including audio and video edit suits.',
 NULL, '[]'),

(5, 'G-03', 'Photography Studio', 'general', 'lab', 10, 'Media Block', '09:00-20:00', 'open',
 'An excellent Photography Studio with Latest Studio Lighting and Trolley system.',
 NULL, '[]'),

(6, 'G-04', 'General & Co-operative Stores', 'general', 'store', 100, 'Main Campus', '08:00-21:00', 'open',
 'Utility shop stocking daily essentials, toiletries, packaged foods, engineering drawing instruments, notebooks, and general stationery.',
 NULL, '[]'),

(39, 'G-05', 'Swimming Pool', 'general', 'sports', 50, 'Sports Complex', '06:00-20:00', 'open',
 'A convenient facility for reserving swimming sessions, managing time slots, and ensuring safe access to the campus swimming pool.',
 NULL, '[]'),

(40, 'G-06', 'Canteens', 'general', 'canteen', 300, 'Main Campus', '07:00-21:00', 'open',
 'Convenient dining spaces offering a variety of meals, snacks, and beverages for students and staff.',
 NULL, '[]'),

(42, 'G-07', 'Sports Materials', 'general', 'sports', 100, 'Sports Complex', '06:00-21:00', 'open',
 'A facility providing sports equipment and essential materials for students to participate in indoor and outdoor games and activities.',
 NULL, '[]');

-- Verify
SELECT COUNT(*) AS total FROM facilities;