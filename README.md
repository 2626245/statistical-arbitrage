
```markdown
# 📊 Statistical Arbitrage in Commodity Futures

This project implements a **statistical arbitrage strategy** on **Brent and WTI crude oil futures**, modeling their spread using linear regression and identifying trading signals through z-scores. A custom-built **React.js web dashboard** is included to visualize strategy performance and insights.

## 🛠 Tech Stack

| Layer         | Technology                          |
|---------------|--------------------------------------|
| Backend       | Python, Pandas, NumPy, Statsmodels   |
| Frontend      | React.js, TypeScript, Material UI    |
| Data Source   | Yahoo Finance (via `yfinance`)       |
| Version Control | Git & GitHub                       |

---

## 📐 Strategy Overview

Statistical arbitrage exploits **mean-reverting behavior** between correlated assets. Here, we use the historical cointegration between Brent (`BZ=F`) and WTI (`CL=F`) crude oil futures.

### 🔁 1. Spread Modeling via Regression

We fit a linear regression:

```

Spread = Brent − (β × WTI + Intercept)

```

Where:
- **β (beta)** = 1.0120 → Hedge ratio
- **Intercept** = 3.7406 → Structural offset

This models the spread as a stationary time series, filtering out long-term trends and highlighting short-term mispricings.

---

### 📊 2. Z-Score Signal Generation

To normalize and identify trading signals:

```

z = (Spread - Mean) / StandardDeviation

````

#### Signal Rules:
| Signal Type  | Condition         | Action                       |
|--------------|-------------------|------------------------------|
| Buy (Long)   | z < -2            | Buy Brent, Sell WTI          |
| Sell (Short) | z > 2             | Sell Brent, Buy WTI          |
| Close        | -0.5 < z < 0.5    | Close all positions          |

---

## 🛡️ Risk Management

- **Volatility filter**: Only trade when spread change > 0.5
- **Minimum holding period**: At least 5 days to reduce overtrading
- **Dynamic position sizing**: Inverse of rolling std deviation
- **Stop-loss**: 2× standard deviation
- **Take-profit**: 4× standard deviation
- **Trailing stop-loss**: 0.02 on spread change

---

## 📈 Performance Highlights

| Metric            | Value        | Interpretation                            |
|-------------------|--------------|--------------------------------------------|
| Total Net Return  | $148.75      | Overall profitability                      |
| Sharpe Ratio      | 0.98         | Risk-adjusted return                       |
| Sortino Ratio     | 252.17       | Return vs. downside deviation              |
| Max Drawdown      | $0.14        | Excellent downside protection              |
| Calmar Ratio      | 133.47       | High returns relative to drawdown risk     |

---

## 🖥️ Dashboard Features (React App)

- 🔄 **Live Signal Status**: Buy / Sell / Hold
- 📈 **Cumulative Returns**: Strategy PnL over time
- 📊 **Spread Metrics**: Live display of current spread, beta, and intercept
- 📉 **Signal Generation Charts**
- 📱 **Responsive Design** using Material UI

---

## 🧪 How to Run the Project Locally

### 📦 Backend (Python Strategy Script)

1. Clone the repo:
   ```bash
   git clone https://github.com/2626245/statistical-arbitrage.git
   cd "statistical-arbitrage"
````

2. Create a virtual environment and activate:

   ```bash
   python -m venv venv
   venv\Scripts\activate   # On Windows
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the main strategy script:

   ```bash
   python run_strategy.py
   ```

---

### 🌐 Frontend (React Dashboard)

1. Go to the dashboard folder:

   ```bash
   cd dashboard
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open your browser and visit: `http://localhost:5173`

---

## 📚 Reference

* Lavrentyev, N. (2025). *Statistical Arbitrage in Commodity Futures*
* Vidyamurthy, G. (2004). *Pairs Trading: Quantitative Methods and Analysis*
* Lopez de Prado, M. (2018). *Advances in Financial Machine Learning*
* Yahoo Finance, React.js Docs, Statsmodels Docs

---

## ⚠️ Disclaimer

This project is for **educational purposes only** and does not constitute financial advice. Backtested results assume ideal conditions and may not reflect live trading performance.

---

## 🙌 Contributions

Pull requests, issues, and ideas are welcome! Feel free to fork and extend.

```

Let me know if you also want a preview `screenshot.png` section or a `requirements.txt` scaffold!
```
