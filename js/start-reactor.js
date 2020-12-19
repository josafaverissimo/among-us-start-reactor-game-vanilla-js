Array.prototype.fillWith = function(f) {
    for(let i = 0; i <= this.length - 1; i++)
        this[i] = f(i)    
    return this
}

startReactor = {
	computerCombination: [],
	playerCombination: [],
	computerCombinationPosition: 1,
	combinationMaxPosition: 5,
	memoryMaxCombination: 9,

	audio: {
		start: 'start.mp3',
		fail: 'fail.mp3',
		complete: 'complete.mp3',
		combinations: new Array(9).fillWith(index => index),

		loadAudio(filename) {
			const file = `./audio/${filename}?&cb=${new Date().getTime()}`
			const audio = new Audio(file)

			audio.load()
			 
			return audio
		},

		loadAudios() {
			if(typeof(this.start) == "object") return
			
			this.start = this.loadAudio(this.start)
			this.complete = this.loadAudio(this.complete)
			this.fail = this.loadAudio(this.fail)
			
			this.combinations = this.combinations.map((filename) => this.loadAudio(`${filename}.mp3`))
		},

	},

	interface: {
		memoryPanel: document.querySelector('.painelMemory'),
		computerLedPanel: document.querySelector('.computerLedPanel'),
		playerLedPanel: document.querySelector('.playerLedPanel'),
		playerMemory: document.querySelector('.playerMemory'),
		playerMemoryButtons: document.getElementsByClassName('player_memory'),

		turnLedOn(index, ledPanel) {
			ledPanel.children[index].classList.add('ledOn')
		},

        turnAllLedsOff() {
            const computerLeds = Array.prototype.flat.call(this.computerLedPanel.children)
            const playerLeds = Array.prototype.flat.call(this.playerLedPanel.children)
            const leds = computerLeds.concat(playerLeds)

            leds.forEach(led => {
                led.classList.remove('ledOn')
            })
        },

        async start() {
            return startReactor.audio.start.play()
        },

        playItem(index, combinationPosition, location = 'computer') {
            const leds = ( location == 'computer' ) ? this.computerLedPanel : this.playerLedPanel
            const memPanel = this.memoryPanel.children[index]

            memPanel.classList.add('memoryActive')
            this.turnLedOn(combinationPosition, leds)
            console.log('Playitem - ' + index)
            startReactor.audio.combinations[index].play().then(() => {
                setTimeout(() => {
                    memPanel.classList.remove('memoryActive')
                }, 150)
            })
            
        },

        endGame(type = 'fail') {
            const memPanel = this.memoryPanel
            const ledPanel = this.computerLedPanel
            const audio = (type == 'complete') ? startReactor.audio.complete : startReactor.audio.fail
            const typeClasses = (type == 'complete')
            ? ['playerMemoryComplete', 'playerLedComplete']
            : ['playerMemoryError', 'playerLedError']

            this.disableButtons()
            this.turnAllLedsOff()

            audio.play().then(() => {
                Array.prototype.forEach.call(memPanel.children, child => {
                    if(child.tagName == 'DIV')
                        child.classList.add(typeClasses[0])
                })

                Array.prototype.forEach.call(ledPanel.children, child => {
                    if(child.tagName == 'DIV')
                        child.classList.add(typeClasses[1])
                })

                setTimeout(() => {
                    Array.prototype.forEach.call(memPanel.children, child => {
                    if(child.tagName == 'DIV')
                        child.classList.remove(typeClasses[0])
                    })

                    Array.prototype.forEach.call(ledPanel.children, child => {
                        if(child.tagName == 'DIV')
                            child.classList.remove(typeClasses[1])
                    })
                }, 900)
            })
        },

        enableButtons() {
            const playerMemory = this.playerMemory
            playerMemory.classList.add('playerActive')

            Array.prototype.forEach.call(playerMemory.children, child => {
                if(child.tagName == "DIV")
                    child.classList.add('playerMemoryActive')
            })
        },

        disableButtons() {
            const playerMemory = this.playerMemory
            playerMemory.classList.remove('playerActive')

            Array.prototype.forEach.call(playerMemory.children, child => {
                if(child.tagName == "DIV")
                    child.classList.remove('playerMemoryActive')
            })
        }
	},

	async load() {
        return new Promise(resolve => {
            console.log('Loading game...')
            this.audio.loadAudios()

            const playerMemory = this.interface.playerMemory
            const memory = this.interface.playerMemoryButtons

            Array.from(memory).forEach(button => {
                button.addEventListener('click', () => {
                    if(playerMemory.classList.contains('playerActive')) {
                        this.play(parseInt(button.dataset.memory))
                        console.log('O valor do elemento clicado é: ' + button.dataset.memory)

                        button.style.animation = 'playermemoryClick .4s'

                        setTimeout(() => button.style.animation = '', 400)
                    }
                })
            })
        })
    },

	start() {
		this.computerCombination = this.createCombination()
		this.computerCombinationPosition = 1
		this.playerCombination = []

        this.interface.start().then(() => {
            setTimeout(() => {
                this.playCombination()
            }, 500)
        })
	},

	createCombination() {
		return new Array(this.memoryMaxCombination).fillWith(() => (Math.floor(Math.random() * this.memoryMaxCombination) + 1) - 1)
	},

    play(index) {
        this.interface.playItem(index, this.playerCombination.length, 'player')
        console.log(this.playerCombination.length)
        this.playerCombination.push(index)

        if(this.isTheRightCombination(this.playerCombination.length)) {
            if(this.playerCombination.length == this.combinationMaxPosition) {
                this.interface.endGame('complete')

                setTimeout(() => {
                    this.start()
                }, 1200)

                return
            }

            if(this.playerCombination.length == this.computerCombinationPosition) {
                this.computerCombinationPosition++
                setTimeout(() => {
                    this.playCombination()
                }, 1200)
            }
        } else {
            this.interface.endGame()
            
            document.getElementById('title').textContent = 'Você é o impostor'

            setTimeout(() => {
                document.getElementById('title').textContent = 'START REACTOR'
                this.start()
            }, 1400)
        }

        
    },
    
    playCombination() {
        this.playerCombination = [];
        this.interface.disableButtons()
        this.interface.turnAllLedsOff()

        this.computerCombination.slice(0, this.computerCombinationPosition).forEach((combination, position) => {
            setTimeout(() => {
                this.interface.playItem(combination, position)
            }, 400 * (position + 1))
        })

        setTimeout(() => {
            this.interface.turnAllLedsOff()
            this.interface.enableButtons()

        }, 600 * this.computerCombinationPosition)
    },

    isTheRightCombination(position) {
        const computerCombination = this.computerCombination.slice(0, position)

        return ( computerCombination.toString() == this.playerCombination.toString())
    }
}