

# 📊 Statistical Arbitrage in Commodity Futures

This project implements a **statistical arbitrage strategy** on **Brent and WTI crude oil futures**, modeling their spread using linear regression and identifying trading signals through z-scores. A custom-built **React.js web dashboard** is included to visualize strategy performance and insights.

## 🛠 Tech Stack

| Layer         | Technology                      |
|--------------|----------------------------------|
| Backend       | Python, Pandas, NumPy, Statsmodels |
| Frontend      | React.js, TypeScript, Material UI |
| Data Source   | Yahoo Finance (via `yfinance`)    |
| Version Control | Git & GitHub                   |

---

## 📐 Strategy Overview

Statistical arbitrage exploits **mean-reverting behavior** between correlated assets. Here, we use the historical cointegration between Brent (`BZ=F`) and WTI (`CL=F`) crude oil futures.

### 🔁 1. Spread Modeling via Regression

We fit a linear regression:



Spread = Brent − (β × WTI + Intercept)



Where:
- `β` =  (hedge ratio)
- `Intercept` = represents a baseline offset between the two prices

### 📊 2. Z-Score Signal Generation

We compute the z-score to normalize the spread:



z = (Spread - Mean) / StandardDeviation



#### Signal Rules:
| Signal Type  | Condition          | Action                        |
|--------------|--------------------|-------------------------------|
| Buy (Long)   | z < -2             | Buy Brent, Sell WTI           |
| Sell (Short) | z > 2              | Sell Brent, Buy WTI           |
| Close        | -0.5 < z < 0.5     | Close all positions           |

---

## 🛡️ Risk Management

- **Volatility filter**: Only trade when spread change > 0.5
- **Dynamic position sizing**: Inverse of rolling std deviation
- **Trailing stop-loss**: Cut losses beyond 0.02
- **Take profit**: 4× spread standard deviation

---

## 📈 Performance Highlights

| Metric            | Value         | Notes                          |
|-------------------|---------------|--------------------------------|
| Total Net Return  | \$148.75      | Based on backtest period       |
| Sharpe Ratio      | 0.98          | Strong risk-adjusted returns   |
| Sortino Ratio     | 252.17        | High returns vs. downside risk |
| Max Drawdown      | \$0.14        | Excellent downside protection  |

---

## 🖥️ Dashboard Features (React App)

- 🔄 Live signal status (Buy / Sell / Hold)
- 📈 Cumulative strategy returns
- 🔍 Current spread, beta, intercept values
- 📊 Responsive chart components (Material UI + Charts)
- 🧠 Clear visualization of how the strategy works

---

## 🧪 How to Run the Project Locally

### 📦 Backend (Python)

1. Clone the repo:
   
   git clone https://github.com/2626245/statistical-arbitrage.git
   npm install
   


3. Create a virtual environment and install dependencies or you can install python dependencies:
   

   
   python -m venv venv
   venv\Scripts\activate     # On Windows
   
   

4. Run the strategy script for the backend on the folder:
   
   python app.py
   

---

### 🌐 Frontend (React Dashboard)

1. Go to the frontend folder:

   
   cd statistical-arbitrage-trading
   


   

2. Start the development server:

   
   npm run dev
   

4. Visit the app at: `http://localhost:5173`

---

## 📚 Reference

* Lavrentyev, N. (2025). *Statistical Arbitrage in Commodity Futures: A Case Study of Brent and WTI*
* Vidyamurthy, G. (2004). *Pairs Trading: Quantitative Methods and Analysis*
* Statsmodels, Yahoo Finance, React.js Docs

---

## ⚠️ Disclaimer

This project is for **educational purposes only** and does not constitute financial advice. Past performance does not guarantee future results.

---

## 🙌 Contributions

Pull requests and feedback are welcome!

---



---

Let me know if you want me to:
- Create the `requirements.txt` from your code
- Auto-generate images or charts for the README
- Write an `About` section for LinkedIn or portfolio

Just say the word.
