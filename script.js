// Calculator State Management
class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.isCalculating = false;
        
        // DOM Elements
        this.currentOperandElement = document.getElementById('current-operand');
        this.previousOperandElement = document.getElementById('previous-operand');
        this.numberButtons = document.querySelectorAll('.btn-number');
        this.operatorButtons = document.querySelectorAll('.btn-operator');
        this.equalsButton = document.querySelector('.btn-equals');
        this.clearButton = document.querySelector('.btn-clear');
        this.deleteButton = document.querySelector('.btn-delete');
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        console.log('Calculator initialized successfully!');
    }
    
    // Update the display
    updateDisplay() {
        this.currentOperandElement.textContent = this.formatNumber(this.currentOperand);
        
        if (this.operation) {
            const operatorSymbol = this.getOperatorSymbol(this.operation);
            this.previousOperandElement.textContent = 
                `${this.formatNumber(this.previousOperand)} ${operatorSymbol}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
        
        // Add calculating animation
        if (this.isCalculating) {
            this.currentOperandElement.classList.add('calculating');
        } else {
            this.currentOperandElement.classList.remove('calculating');
        }
    }
    
    // Format number for display
    formatNumber(number) {
        const num = parseFloat(number);
        if (isNaN(num)) return number;
        
        // Handle very large numbers
        if (Math.abs(num) > 999999999999) {
            return num.toExponential(6);
        }
        
        // Format with commas for thousands
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 8
        }).format(num);
    }
    
    // Get operator symbol for display
    getOperatorSymbol(operation) {
        switch(operation) {
            case '+': return '+';
            case '-': return '−';
            case '×': return '×';
            case '÷': return '÷';
            case '%': return '%';
            default: return operation;
        }
    }
    
    // Reset calculator
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.removeActiveOperator();
        this.updateDisplay();
    }
    
    // Delete last character
    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }
    
    // Append number
    appendNumber(number) {
        if (this.currentOperand === '0' || this.shouldResetScreen) {
            this.currentOperand = number;
            this.shouldResetScreen = false;
        } else {
            // Prevent exceeding max length
            if (this.currentOperand.length < 15) {
                this.currentOperand += number;
            }
        }
        this.updateDisplay();
    }
    
    // Add decimal point
    addDecimal() {
        if (this.shouldResetScreen) {
            this.currentOperand = '0.';
            this.shouldResetScreen = false;
        } else if (!this.currentOperand.includes('.')) {
            this.currentOperand += '.';
        }
        this.updateDisplay();
    }
    
    // Set active operator
    setActiveOperator(operator) {
        this.removeActiveOperator();
        
        const operatorButton = Array.from(this.operatorButtons).find(
            btn => btn.getAttribute('data-operator') === operator
        );
        
        if (operatorButton) {
            operatorButton.classList.add('active');
        }
    }
    
    // Remove active operator styling
    removeActiveOperator() {
        this.operatorButtons.forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Choose operation
    chooseOperation(operator) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '' && !this.shouldResetScreen) {
            this.calculate();
        }
        
        this.operation = operator;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
        this.isCalculating = true;
        
        this.setActiveOperator(operator);
        this.updateDisplay();
    }
    
    // Calculate percentage
    calculatePercentage() {
        const value = parseFloat(this.currentOperand);
        if (!isNaN(value)) {
            this.currentOperand = (value / 100).toString();
            this.updateDisplay();
        }
    }
    
    // Perform calculation
    calculate() {
        if (!this.operation || !this.previousOperand || this.shouldResetScreen) return;
        
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        let result;
        
        // Check for division by zero
        if (this.operation === '÷' && current === 0) {
            this.currentOperand = 'Cannot divide by zero';
            this.previousOperand = '';
            this.operation = null;
            this.shouldResetScreen = true;
            this.removeActiveOperator();
            this.updateDisplay();
            
            // Reset after error
            setTimeout(() => {
                this.clear();
            }, 2000);
            return;
        }
        
        // Perform calculation
        switch(this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                result = prev / current;
                break;
            case '%':
                result = prev % current;
                break;
            default:
                return;
        }
        
        // Handle result
        if (isNaN(result) || !isFinite(result)) {
            this.currentOperand = 'Error';
        } else {
            // Round to avoid floating point precision issues
            result = Math.round(result * 100000000) / 100000000;
            this.currentOperand = result.toString();
        }
        
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = true;
        this.isCalculating = false;
        this.removeActiveOperator();
        this.updateDisplay();
    }
    
    // Handle keyboard input
    handleKeyboardInput(event) {
        const key = event.key;
        
        // Prevent default for calculator keys
        if (key.match(/[0-9\.\+\-\*\/%]|Enter|Escape|Backspace/)) {
            event.preventDefault();
        }
        
        // Number keys 0-9
        if (key >= '0' && key <= '9') {
            this.appendNumber(key);
            this.addButtonEffect(this.findButtonByKey(key));
            return;
        }
        
        // Decimal point
        if (key === '.') {
            this.addDecimal();
            this.addButtonEffect(this.findButtonByKey(key));
            return;
        }
        
        // Operators
        if (key === '+') {
            this.chooseOperation('+');
            this.addButtonEffect(this.findButtonByKey(key));
            return;
        }
        
        if (key === '-') {
            this.chooseOperation('-');
            this.addButtonEffect(this.findButtonByKey(key));
            return;
        }
        
        if (key === '*') {
            this.chooseOperation('×');
            this.addButtonEffect(this.findButtonByKey('×'));
            return;
        }
        
        if (key === '/') {
            this.chooseOperation('÷');
            this.addButtonEffect(this.findButtonByKey('÷'));
            return;
        }
        
        if (key === '%') {
            this.calculatePercentage();
            this.addButtonEffect(this.findButtonByKey('%'));
            return;
        }
        
        // Equals/Enter
        if (key === '=' || key === 'Enter') {
            this.calculate();
            this.addButtonEffect(this.equalsButton);
            return;
        }
        
        // Clear/Escape
        if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
            this.addButtonEffect(this.clearButton);
            return;
        }
        
        // Delete/Backspace
        if (key === 'Delete' || key === 'Backspace') {
            this.delete();
            this.addButtonEffect(this.deleteButton);
            return;
        }
    }
    
    // Find button by key
    findButtonByKey(key) {
        // Number buttons
        if (key >= '0' && key <= '9') {
            return Array.from(this.numberButtons).find(
                btn => btn.getAttribute('data-number') === key
            );
        }
        
        // Operator buttons
        const operatorMap = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷',
            '%': '%',
            '.': '.'
        };
        
        if (operatorMap[key]) {
            return Array.from(this.operatorButtons).find(
                btn => btn.getAttribute('data-operator') === operatorMap[key]
            ) || document.querySelector(`[data-number="${key}"]`);
        }
        
        // Action buttons
        if (key === '=' || key === 'Enter') return this.equalsButton;
        if (key === 'Escape') return this.clearButton;
        if (key === 'Delete' || key === 'Backspace') return this.deleteButton;
        
        return null;
    }
    
    // Add button press effect
    addButtonEffect(button) {
        if (!button) return;
        
        button.style.transform = 'scale(0.95)';
        button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.boxShadow = '';
        }, 150);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Number buttons
        this.numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                const number = button.getAttribute('data-number');
                
                if (number === '.') {
                    this.addDecimal();
                } else {
                    this.appendNumber(number);
                }
                
                this.addButtonEffect(button);
            });
        });
        
        // Operator buttons
        this.operatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                const operator = button.getAttribute('data-operator');
                
                if (operator === '%') {
                    this.calculatePercentage();
                } else {
                    this.chooseOperation(operator);
                }
                
                this.addButtonEffect(button);
            });
        });
        
        // Equals button
        this.equalsButton.addEventListener('click', () => {
            this.calculate();
            this.addButtonEffect(this.equalsButton);
        });
        
        // Clear button
        this.clearButton.addEventListener('click', () => {
            this.clear();
            this.addButtonEffect(this.clearButton);
        });
        
        // Delete button
        this.deleteButton.addEventListener('click', () => {
            this.delete();
            this.addButtonEffect(this.deleteButton);
        });
        
        // Keyboard support
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });
        
        // Prevent context menu on buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('contextmenu', (e) => e.preventDefault());
        });
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    
    // Add some example calculations to console
    console.log('=== Modern Calculator ===');
    console.log('Try these calculations:');
    console.log('1. 12 + 8 = 20');
    console.log('2. 15 × 3 = 45');
    console.log('3. 50 ÷ 2 = 25');
    console.log('4. 100 - 75 = 25');
    console.log('5. 10 + 5 × 2 = 20 (follows order of operations)');
    console.log('=========================');
});