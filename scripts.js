let darkMode = localStorage.getItem("darkMode");

const Modal = {
  open() {
    document.querySelector(".modal-overlay.add").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay.add").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Filter = {
  open() {
    document.querySelector(".modal-overlay.filter").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay.filter").classList.remove("active");
  },
  startDate: document.querySelector("input#startDate"),
  endDate: document.querySelector("input#endDate"),
  income: document.querySelector("input#input-income"),
  expense: document.querySelector("input#input-expense"),
  submit() {
    Filter.close();

    const Dates = Transaction.all.filter(
      (item) =>
        item.date >= Utils.formatDate(Filter.startDate.value) &&
        item.date <= Utils.formatDate(Filter.endDate.value)
    );

    let filteredDates = Dates;

    if (Filter.income.checked === true && Filter.expense.checked === true) {
    } else if (Filter.income.checked === true) {
      filteredDates = Dates.filter((item) => item.amount >= 0);
    } else if (Filter.expense.checked === true) {
      filteredDates = Dates.filter((item) => item.amount < 0);
    }

    DOM.clearTransactions();
    filteredDates.forEach((element) => {
      DOM.addTransaction(element);
    });
  },
};

const Theme = {
  enable() {
    document.body.classList.add("darkmode");
    localStorage.setItem("darkMode", "enabled");
    document.getElementById("theme_icon").src = "../assets/theme-dark.svg";
    document.querySelector(".background").src =
      "../assets/background-shape-dark.svg";
    document.querySelector(".svg-down").src = "../assets/down-dark.svg";
  },
  disable() {
    document.body.classList.remove("darkmode");
    localStorage.setItem("darkMode", "null");
    document.getElementById("theme_icon").src = "../assets/theme-light.svg";
    document.querySelector(".background").src =
      "../assets/background-shape.svg";
    document.querySelector(".svg-down").src = "../assets/down.svg";
  },
  click() {
    let darkMode = localStorage.getItem("darkMode");

    if (darkMode !== "enabled") {
      this.enable();
    } else {
      this.disable();
    }
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },

  expenses() {
    let expense = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td class="actions">
  
      <button  onclick="Transaction.remove(${index})" class="button_action">
        <img src="./assets/trash.svg" alt="Remover transação">
      </button>
      </button>

      </td>
      `;

    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, "")) * 100;

    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  income: document.querySelector("input#input-radio-income"),
  expense: document.querySelector("input#input-radio-expense"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    if (Form.expense.checked === true && amount > 0) {
      amount = amount * -1;
    }

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction);
      Form.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    DOM.updateBalance();

    Storage.set(Transaction.all);

    if (darkMode === "enabled") {
      Theme.enable();
      document.getElementById("theme_icon").src = "../assets/theme-dark.svg";
    }

    if (Transaction.total() >= 0) {
      document.querySelector(".situation").innerHTML =
        "<span>Seu saldo está positivo</span> <pre> <img src='./assets/ambitious.png' >";
      document.querySelector(".phrase").innerHTML =
        "Você está construindo seu imperio!";
      document.querySelector(".icon").src =
        "./assets/positive-illustration.svg";
    } else {
      document.querySelector(".situation").innerHTML =
        "<span>Seu saldo está negativo</span> <pre> <img src='./assets/sad.png' >";
      document.querySelector(".phrase").innerHTML =
        "Talvez você precise controlar seus gastos.";
      document.querySelector(".icon").src =
        "./assets/negative-illustration.svg";
    }
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

const Csv = {
  exportCSVFile(headers, items, fileTitle) {
    if (headers) {
      items.unshift(headers);
    }

    var jsonObject = JSON.stringify(items);

    var csv = Csv.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + ".csv" || "export.csv";

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) {
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilenmae);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },
  convertToCSV(objArray) {
    var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    var str = "";

    for (var i = 0; i < array.length; i++) {
      var line = "";
      for (var index in array[i]) {
        if (line != "") line += ",";

        line += array[i][index];
      }

      str += line + "\r\n";
    }

    return str;
  },
  download() {
    var headers = {
      description: "Nome".replace(/,/g, ""),
      amount: "Valor",
      date: "Data",
    };

    itemsNotFormatted = Storage.get();

    var itemsFormatted = [];

    itemsNotFormatted.forEach((item) => {
      itemsFormatted.push({
        description: item.description,
        amount: `R$ ${item.amount}`,
        date: item.date,
      });
    });

    var fileTitle = "Minhas Transações - DevFinances";

    Csv.exportCSVFile(headers, itemsFormatted, fileTitle);
  },
};

App.init();
