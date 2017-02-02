// manage state with state object
// results array
var state = {
  results: []
};

// modify state functions
// after question, push object to results array
// foundCorrect true or false
// splice question object from questions.js
function registerResult(state, isCorrect) {
  state.results.push({
    foundCorrect: isCorrect
  });
}

function deleteQuestion(questionsArr, index) {
  questionsArr.splice(index, 1);
}

function getQuestion(questionsArr) {
  var randomIndex = Math.floor(Math.random()*questionsArr.length);
  var currentQuestion = questionsArr[randomIndex];
  deleteQuestion(questionsArr, randomIndex);
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
function displayResults(state, questionsArr, element) { // How can I write this in a more readable way?
  var htmlStr = "<ul class='js-results-display'><li>Score: "+getCurrentScore(state)+"</li><li>Question: "+(10-questionsArr.length)+" /10</li></ul>";
  element.html(htmlStr);
}

function displayQuestion(currentQuestion, element) {
  element.html("<h3>"+currentQuestion.question+"</h3>");
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
  // randomly choose when correct reponse is passed 0-3 number
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

function evaluateUserAnswer(answer, currentTarget) {
  // Retrieve data from the DOM --> Retrieve user's answer and evaluate it
  $(".correct").css("background-color", "green");
  if (answer === "correct") {
    return true;
  }
  else {
    $(currentTarget).css("background-color", "red");
    return false;
  }
}

function disableClickEvent(element) {
  element.css("pointer-events", "none");
}
function enableClickEvent(element) {
  element.css("pointer-events", "auto");
}

function doQuiz(state, questions, btn) {
  // Starts a new round of the quiz
  disableClickEvent(btn);
  var theQuestion = getQuestion(questions);
  displayResults(state, questions, $(".js-info"));
  displayQuestion(theQuestion, $(".js-question-bin"));
  renderChoicesHtml(theQuestion, $(".js-choice-list"));
}

// Event handlers
function handleResponses(state, element, questions, btn) {
  element.on("click", "li", function(event) {
    var userChoice = $(this).attr("class");
    var isCorrect = evaluateUserAnswer(userChoice, this);
    registerResult(state, isCorrect);
    userMessage(state, $(".js-info"));
    if (state.results.length === 10) {
      // Reset for a new game
      console.log("new game");
    }
    else {
      enableClickEvent(btn);
      handleNextQuestion(btn);
    }
  });
}

function handleNextQuestion(btn) {
  btn.on("click", function(event) {
    doQuiz(state, questions, btn);
  });
}

// Document Ready
$(function mainFn() {
  // Get the first question and set in DOM
  doQuiz(state, questions, $(".js-btn-next-question"));
  // Handle all user clicks and responses to questions
  handleResponses(state, $(".js-choice-list"), questions, $(".js-btn-next-question"));
});
