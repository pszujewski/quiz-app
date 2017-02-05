// manage state with state object
// results array
var state = {
  results: [],
  questionsBin: cloneData(questions)
};

// Funtions for modifying state and retrieving data from state
// after question, push object to results array
// foundCorrect boolean property will be assigned for every submitted question
// Clone the questions data first
function cloneData(item) {
  // To successfully clone JS objects in the global questions array.
  if (typeof item !== "object") {
    return item;
  }
  else {
    if (item instanceof Array) {
      var clone = [];
      for (var i=0; i<item.length; i++) {
        clone[i] = cloneData(item[i]);
      }
    }
    else if (item instanceof Object) {
      var clone = {};
      for (var key in item) {
        clone[key] = cloneData(item[key]);
      }
    }
  }
  return clone;
}

function registerResult(state, isCorrect) {
  state.results.push({
    foundCorrect: isCorrect
  });
}

function deleteQuestion(state, index) {
  state.questionsBin.splice(index, 1);
}

function getQuestion(state) {
  var randomIndex = Math.floor(Math.random()*state.questionsBin.length);
  var currentQuestion = state.questionsBin[randomIndex];
  deleteQuestion(state, randomIndex);
  return currentQuestion;
}

function getCurrentScore(state) {
  var score = 0;
  for (let i=0; i<state.results.length; i++) {
    if (state.results[i].foundCorrect) {
      score++;
    }
  }
  return score;
}

// Generate html and render functions
function promptStart(element, btnHide) {
  btnHide.hide();
  var promptHtml = (
    "<div class='prompt'>"+
      "<h1 class='quiz-title'>Geography Quiz!</h1>"+
      "<button class='start-btn'>Start Quiz</button>"+
    "</div>"
  );
  element.html(promptHtml);
}

function displayResults(state, element) {
  var htmlStr = "<ul class='js-results-display'><li>Score: "+getCurrentScore(state)+"</li><li>Question: "+(10-state.questionsBin.length)+" /10</li></ul>";
  element.html(htmlStr);
}

function displayQuestion(currentQuestion, element) {
  element.html("<h3 class='question'>"+currentQuestion.question+"</h3>");
}

function renderItem(currentQuestion, index, correctIndex) {
  if (index === correctIndex) {
    return "<li class='correct'>"+currentQuestion.correct+"</li>";
  } else {
    let choiceIndex = Math.floor(Math.random()*currentQuestion.choices.length);
    let str = "<li class='not-correct'>"+currentQuestion.choices[choiceIndex]+"</li>"
    currentQuestion.choices.splice(choiceIndex, 1);
    return str;
  }
}

function renderChoicesHtml(currentQuestion, element) {
  // randomly choose when correct reponse will be passed into the DOM
  // if number matches currently passed index in loop, pass the correct answer choice
  var correctIndex = Math.floor(Math.random()*3+1);
  var html = [];
  for (let index=0; index<4; index++) {
    html.push(renderItem(currentQuestion, index, correctIndex));
  }
  element.html(html);
}

function userMessage(state, element) {
  element.append(makeMessage(state));
  function makeMessage(state) {
    if (state.results[state.results.length-1].foundCorrect) {
      return "<p class='user-msg'>Correct!</p>";
    } else {
      return "<p class='user-msg'>Sorry, wrong answer...</p>";
    }
  }
}

function showFinalScore(state, element) {
  var finalHtml = (
    "<div class='prompt'>"+
      "<h2>Your Final Score is: "+getCurrentScore(state)+" /10</h2>"+
      "<h2>Want to try again? Click the button below to start a new quiz</h2>"+
    "</div>"
  );
  element.html(finalHtml);
}

function evaluateUserAnswer(answer, currentTarget) {
  // Retrieve data from the DOM --> Retrieve user's answer and evaluate it
  $(".correct").css("background-color", "#00a74a");
  if (answer === "correct") {
    return true;
  }
  else {
    $(currentTarget).css("background-color", "#f44336");
    return false;
  }
}

function disableClickEvent(element) {
  element.css("pointer-events", "none");
}
function enableClickEvent(element) {
  element.css("pointer-events", "auto");
}

function doQuiz(state, btn, newGameBtn) {
  // Starts a new round of the quiz
  disableClickEvent(btn);
  newGameBtn.hide();
  var theQuestion = getQuestion(state);
  displayResults(state, $(".js-info"));
  displayQuestion(theQuestion, $(".js-question-bin"));
  renderChoicesHtml(theQuestion, $(".js-choice-list"));
}

// Event handlers
function handleStartGame(state, startHandler, btnHide, element, btn, newGameBtn) {
  startHandler.one("click", "button", function(event) {
    btnHide.show();
    doQuiz(state, btn, newGameBtn);
    handleResponses(state, element, btn, newGameBtn);
  });
}

function handleResponses(state, element, btn, newGameBtn) {
  element.on("click", "li", function(event) {
    disableClickEvent(element);
    var userChoice = $(this).attr("class");
    var isCorrect = evaluateUserAnswer(userChoice, this);
    registerResult(state, isCorrect);
    userMessage(state, $(".js-info"));
    if (state.results.length === 10) {
      // Show final score and reset for a new game
      enableClickEvent(newGameBtn);
      newGameBtn.show();
      btn.hide();
      showFinalScore(state, $(".js-question-bin"));
      handleNewGame(state, btn, element, newGameBtn);
    }
    else { // the game continues
      enableClickEvent(btn);
      handleNextQuestion(state, element, btn, newGameBtn);
    }
  });
}

function handleNextQuestion(state, element, btn, newGameBtn) {
  btn.one("click", function(event) {
    enableClickEvent(element);
    doQuiz(state, btn, newGameBtn);
  });
}

function handleNewGame(state, btn, element, newGameBtn) {
  newGameBtn.one("click", function(event) {
    btn.show();
    enableClickEvent(element);
    disableClickEvent(newGameBtn);
    state.questionsBin = cloneData(questions); // reset questionsBin array of questions
    state.results = [];
    doQuiz(state, btn, newGameBtn);
  });
}

// Document Ready
$(function mainFn() {
  // Set up the prompt to start the game
  promptStart($(".js-question-bin"), $(".btn-container"));
  // Start the game
  handleStartGame(
    state, $(".js-question-bin"), $(".btn-container"), $(".js-choice-list"), $(".js-btn-next-question"), $(".js-btn-new-game"));
});
