const expressionDisplay = document.querySelector("#expression");
const resultDisplay = document.querySelector("#result");
const keypad = document.querySelector("#keypad");

let expression = "";
let hasResult = false;

function updateDisplay() {
  expressionDisplay.textContent = expression || "0";
  if (!resultDisplay.classList.contains("error")) {
    resultDisplay.textContent = expression ? getPreview(expression) : "0";
  }
}

function getPreview(value) {
  try {
    return formatNumber(calculate(value));
  } catch {
    return "";
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }
  return parseFloat(value.toFixed(10)).toString();
}

function calculate(value) {
  const tokens = value.match(/\d*\.?\d+|[+\-×÷]/g);
  if (!tokens || tokens.join("") !== value || !/^\d/.test(value) || /[+\-×÷]$/.test(value)) {
    throw new Error("Invalid expression");
  }

  const numbers = [parseFloat(tokens[0])];
  const operators = [];
  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const number = parseFloat(tokens[index + 1]);
    if (!Number.isFinite(number)) {
      throw new Error("Invalid expression");
    }
    operators.push(operator);
    numbers.push(number);
  }

  const reducedNumbers = [numbers[0]];
  const reducedOperators = [];
  for (let index = 0; index < operators.length; index += 1) {
    const operator = operators[index];
    const nextNumber = numbers[index + 1];
    switch (operator) {
      case "×":
        reducedNumbers[reducedNumbers.length - 1] *= nextNumber;
        break;
      case "÷":
        if (nextNumber === 0) {
          throw new Error("Cannot divide by zero");
        }
        reducedNumbers[reducedNumbers.length - 1] /= nextNumber;
        break;
      default:
        reducedOperators.push(operator);
        reducedNumbers.push(nextNumber);
    }
  }

  return reducedNumbers.reduce((total, number, index) => {
    if (index === 0) return number;
    return reducedOperators[index - 1] === "+" ? total + number : total - number;
  }, 0);
}

function showError(message) {
  resultDisplay.textContent = message;
  resultDisplay.classList.add("error");
}

function clearCalculator() {
  expression = "";
  hasResult = false;
  resultDisplay.classList.remove("error");
  updateDisplay();
}

function appendValue(value) {
  if (resultDisplay.classList.contains("error")) clearCalculator();
  if (hasResult && /\d|\./.test(value)) expression = "";
  if (value === ".") {
    const currentNumber = expression.split(/[+\-×÷]/).pop();
    if (currentNumber.includes(".")) return;
    if (!currentNumber) expression += "0";
  }
  if (/[+\-×÷]/.test(value) && !expression) return;
  if (/[+\-×÷]/.test(value) && /[+\-×÷]$/.test(expression)) {
    expression = expression.slice(0, -1);
  }
  expression += value;
  hasResult = false;
  resultDisplay.classList.remove("error");
  updateDisplay();
}

function removeLast() {
  if (resultDisplay.classList.contains("error")) return clearCalculator();
  expression = expression.slice(0, -1);
  hasResult = false;
  updateDisplay();
}

function evaluateExpression() {
  if (!expression) return;
  try {
    const value = calculate(expression);
    resultDisplay.textContent = formatNumber(value);
    resultDisplay.classList.remove("error");
    hasResult = true;
  } catch (error) {
    showError(error.message);
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, value } = button.dataset;
  if (action === "clear") clearCalculator();
  else if (action === "backspace") removeLast();
  else if (action === "equals") evaluateExpression();
  else appendValue(value);
});

document.addEventListener("keydown", (event) => {
  const keyMap = { "/": "÷", "*": "×" };
  if (/\d|[.+\-]/.test(event.key)) appendValue(event.key);
  else if (keyMap[event.key]) appendValue(keyMap[event.key]);
  else if (event.key === "Enter" || event.key === "=") evaluateExpression();
  else if (event.key === "Backspace") removeLast();
  else if (event.key === "Escape") clearCalculator();
  else return;
  event.preventDefault();
});

updateDisplay();
