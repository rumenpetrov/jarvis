if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
  throw new Error("Your browser doesn't support SpeechRecognition.")
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const speechInstance = new SpeechRecognition()

const Speak = msg => {
  let supportSpeaking = false

  if (!('SpeechSynthesisUtterance' in window) && !('speechSynthesis' in window)) {
    console.warn("Your browser doesn't support Speech.")
  } else {
    supportSpeaking = true
  }

  if (!supportSpeaking) {
    return undefined
  }

  const { speechSynthesis } = window
  const speakInstance = new SpeechSynthesisUtterance()

  speakInstance.text = msg
  speakInstance.volumen = 1
  speakInstance.rate = 0.8
  speakInstance.pitch = 0.3

  speechSynthesis.speak(speakInstance)
}

const Trigger = {
  node: document.getElementById('js-talk-trigger'),
  enable: function () {
    this.node.classList.add('is-active')
  },
  disable: function () {
    this.node.classList.remove('is-active')
  }
}

const STATUS = {
  INITIAL: 'Click the button to talk. \n(Say help to see the available commands)',
  ACTIVE: 'Listening...',
  NO_SPEECH: 'No speech.'
}

const Status = {
  node: document.getElementById('js-status'),
  setInitial: function () {
    this.node.innerText = STATUS.INITIAL
  },
  setActive: function () {
    this.node.innerText = STATUS.ACTIVE
  },
  setNoSpeach: function () {
    this.node.innerText = STATUS.NO_SPEECH
  }
}

const Response = {
  node: document.getElementById('js-response'),
  show: function () {
    this.node.classList.add('is-visible')
  },
  hide: function () {
    this.node.classList.remove('is-visible')
  },
  setContent: function (childNode) {
    this.node.textContent = null
    this.show()
    this.node.append(childNode)
  },
  clear: function () {
    this.hide()
    this.node.textContent = null
  }
}

const Input = {
  node: document.getElementById('js-input'),
  show: function () {
    this.node.classList.add('is-visible')
  },
  hide: function () {
    this.node.classList.remove('is-visible')
  },
  setText: function (msg) {
    this.show()
    this.node.innerText = msg
  },
  clear: function () {
    this.hide()
    this.node.innerText = null
  }
}

const COMMAND_LIST = ['hello', 'help']

const ACTION = {
  HELLO: {
    COMMAND: 'hello',
    ANSWER: 'Hi, I am Jarvis. How can i help you?',
    RESPONSE: () => {
      Response.clear()
    }
  },
  HELP: {
    COMMAND: 'help',
    ANSWER: 'Are you looking for help? These are the available commands.',
    RESPONSE: function () {
      let children = document.createElement('ul')

      COMMAND_LIST.map(command => {
        const elLine = document.createElement('li')

        elLine.innerText = command

        children.append(elLine)
      })

      Response.setContent(children)
    }
  }
}

let isListening = false

Status.setInitial()
Input.hide()

Trigger.node.addEventListener('click', () => {
  if (!isListening) {
    speechInstance.start()
  }
})

speechInstance.onstart = () => {
  isListening = true

  Trigger.enable()
  Status.setActive()
  Response.clear()
}

speechInstance.onresult = event => {
  isListening = false

  Trigger.disable()
  Status.setInitial()

  let isCommandMatched = false
  const { resultIndex, results } = event
  const transcript = results[resultIndex][0].transcript

  Input.setText(transcript)

  COMMAND_LIST.map(command => {
    if (transcript.includes(command)) {
      const cmd = command.toUpperCase()

      isCommandMatched = true

      Speak(ACTION[`${cmd}`].ANSWER)
      ACTION[`${cmd}`].RESPONSE()
    }
  })

  if (!isCommandMatched) {
    Speak(ACTION.HELP.ANSWER)
    ACTION.HELP.RESPONSE()
  }
}

speechInstance.onerror = () => {
  Status.setNoSpeach()
  Speak('Hey, are you there?')
}

speechInstance.onend = () => {
  isListening = false

  Trigger.disable()
  Status.setInitial()
}
