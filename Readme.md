
---
# 🧠 SkillBridge – Learn, Earn & Certify on Web3

### A Decentralized Learning Platform for Token-Gated Education, AI Tutoring, and NFT Certification

> Empowering learners to **earn tokens**, **enroll in Web3 courses**, and **mint NFT certificates** — all backed by **smart contracts**, **IPFS**, and **AI**.

---

## 🌐 Live Demo

* 🌍 Frontend: [https://skillbridgedapp-iucb.vercel.app](https://skillbridgedapp-iucb.vercel.app)
* 🛠️ Backend API: [https://skillbridgedapp.onrender.com](https://skillbridgedapp.onrender.com)

---

## 🚨 The Problem

* ❌ Centralized learning platforms limit student ownership
* ❌ No verifiable proof of learning or skill
* ❌ Lack of personalization and engagement
* ❌ Instructors are underpaid and under-credited
* ❌ Poor content protection and transparency

---

## ✅ Our Solution: SkillBridge

**SkillBridge** solves these challenges with a full-stack Web3 learning ecosystem:

* 🧪 Skill test to earn tokens
* 🎓 Token-based course enrollment
* 🤖 AI chatbot assistance per course
* 🏆 NFT certificate generation
* 📂 IPFS storage for metadata
* 🔐 Smart contracts for logic & access

---

## 💡 Key Features / USPs

* 🦊 **MetaMask Authentication**
* 🪙 **ERC-20 Token (SKL)** – rewarded for passing skill tests
* 🎓 **Token-Gated Course Enrollment**
* 🧠 **AI Chatbot Tutors** powered by OpenAI + ChromaDB
* 🗂️ **IPFS-Pinned Course Content**
* 🖼️ **ERC-721 NFT Certificates** minted upon completion
* 🔐 **Smart Contract Access Control**

---

## 🔗 Web3 Contract System

### 🪙 ERC-20: SkillBridgeToken

* Used to **reward learners** and enable **paid course enrollment**
* Learners earn SKL tokens upon test completion
* Tokens are **transferable** and **tracked on-chain**

**Example Functions:**

```solidity
mint(address to, uint amount);
transfer(address to, uint amount);
balanceOf(address user);
```

---

### 🖼️ ERC-721: SkillBridgeNFT

* **NFT Certificates** minted upon successful course completion
* Metadata (name, date, course, image) stored on **IPFS**
* Each NFT is **unique and verifiable**

**Example Functions:**

```solidity
mintCertificate(address user, string memory tokenURI);
tokenURI(uint tokenId) public view returns (string);
ownerOf(uint tokenId);
```

---

### 🧩 SkillBridgeMain (Core Contract)

* Manages:

  * Skill test tracking
  * Course enrollment
  * NFT certificate mapping
* Tracks which user completed which course/test

---

## 🧠 How It Works

### 👨‍🎓 Learner Journey

1. Connects wallet (MetaMask)
2. Takes a **skill entry test**
3. Earns **SKL tokens** on passing
4. Uses SKL to **enroll in token-gated courses**
5. Learns with **AI tutor**
6. Takes quiz → Passes → NFT **certificate minted**

---

## 👨‍🏫 Instructor Journey

1. Creates & uploads course metadata (IPFS)
2. Trains AI chatbot via **Ingest Vector** button
3. Publishes course on-chain
4. Learners can discover & enroll in the course

---

## 🚀 Local Setup Guide

### 📦 Clone Repo

```bash
git clone https://github.com/ketandayke/skillbridgedapp.git
cd skillbridgedapp
```

---

### 🖼️ Frontend Setup

```bash
cd skillbridge-frontend
npm install
npm run dev
```

Runs on: [http://localhost:5173](http://localhost:5173)

---

### 🖥️ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Runs on: [http://localhost:5000](http://localhost:5000)

Create `.env` file:

```env
PINATA_API_KEY=your-key
PINATA_SECRET_KEY=your-secret
OPENAI_API_KEY=your-openai-key
CHROMA_DB_URL=http://localhost:8000
```

---

## 📜 Smart Contracts Deployment

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Update contract addresses inside `Web3Context.jsx`.

---

## 🧠 AI Chatbot Flow

* Each course has custom content
* Instructors index content → **ChromaDB**
* Learners use chat interface → OpenAI responds with **contextual answers**

---

## 🖼️ NFT Certificate Flow

* User passes course quiz
* Result & metadata sent to backend
* Certificate image generated via HTML → PNG
* Image + metadata uploaded to **IPFS**
* Smart contract mints NFT using the IPFS metadata

---

## 📸 Screenshots

>
![SkillBridge Home](./SkillBridgeDApp/public/frontend_home.png)
![SkillBridge Home](./SkillBridgeDApp/public/skillbridgedapp-logo.jpg)

> Add more soon: AI Chat UI, Quiz UI, NFT Certificate Preview, Profile Page

---

## ⚙️ Technologies Used

| Layer      | Tools & Libraries                            |
| ---------- | -------------------------------------------- |
| Frontend   | React, Vite, TailwindCSS, React Router       |
| Backend    | Node.js, Express, Multer, Pinata SDK, OpenAI |
| Blockchain | Solidity, Hardhat, Ethers.js                 |
| Storage    | IPFS (via Pinata)                            |
| AI Layer   | OpenAI API + ChromaDB                        |
| Deployment | Vercel (Frontend), Render (Backend)          |
| Wallet     | MetaMask + Ethers.js                         |

---

## ✨ Unique Selling Points (USP)

* 🧠 **Course-Specific AI Tutors**
* 🧪 **Token-Driven Motivation**
* 🎓 **Decentralized Learning Experience**
* 🖼️ **Verifiable NFTs as Proof of Learning**
* 🔐 **Smart Contract–Secured Access**
* ⚙️ **Gas-Optimized Architecture**

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🙌 Acknowledgements

* [OpenAI](https://openai.com/)
* [Pinata](https://pinata.cloud/)
* [ChromaDB](https://www.trychroma.com/)
* [Hardhat](https://hardhat.org/)
* [Render](https://render.com/)
* [Vercel](https://vercel.com/)

---

## 🔗 Contact

For collaborations or queries:

| Name        | LinkedIn                                                      | GitHub                                       | Email                                                     |
| ----------- | ------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- |
| Ketan Dayke | [LinkedIn](https://www.linkedin.com/in/ketan-dayke-kd050703/) | [@ketandayke](https://github.com/ketandayke) | [ketdayke@gmail.com](mailto:ketdayke@gmail.com)           |
| Rahul Soni  | [LinkedIn](https://www.linkedin.com/in/rahul-soni-56b165280/) | [@rahuls2764](https://github.com/rahuls2764) | [sonirahul2764@gmail.com](mailto:sonirahul2764@gmail.com) |

---

> Made with ❤️ by the **SkillBridge Team**

