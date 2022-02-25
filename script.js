let matrix = null
let start = true
let go = null
let detector = null
let delta = null
const name = prompt('Enter your name')

/*   создаём поле заполнения   */
function getField(columns, rows, mine) {
	const matrix = []
	let idNum = 1
	for (let y = 0; y < rows; y++) {
		const row = []
		for (let x = 0; x < columns; x++) {
			row.push({
				id: idNum++,
				x,
				y,
				mine: false,
				flag: false,
				number: 0,
				left: false,
				right: false,
				show: false,
				light: false,
			})
		}
		matrix.push(row)
	}
	return matrix
}

/*   выбираем случайную клетку   */
function getRandomPoint(matrix) {
	const freePoint = [];
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			const point = matrix[y][x]
			if (!point.mine) {
				freePoint.push(point)
			}
		}
	}
	const index = Math.floor(Math.random() * freePoint.length);
	return freePoint[index];
}

/*   ставим мину & добавляем индексы соседним  */
function setMine(matrix) {
	const point = getRandomPoint(matrix);
	point.mine = true

	const points = getAroundPoint(matrix, point.x, point.y);
	for (let point of points) {
		point.number += 1
	}
}

/*   ставим мины по уровню сложности   */




/*  выбираем клетку  */
function getPoint(matrix, x, y) {
	if (!matrix[y] || !matrix[y][x]) {
		return false
	}
	return matrix[y][x]
}

/*   обходим клетку для простановки индексов мин */
function getAroundPoint(matrix, x, y) {
	const points = []
	for (let dx = -1; dx <= 1; dx++) {
		for (let dy = -1; dy <= 1; dy++) {

			const point = getPoint(matrix, x + dx, y + dy)
			if (!point) {
				continue
			}
			if (point.x === x && point.y === y) {
				continue
			}
			points.push(point)
		}
	}
	return points
}

function gameBody(matrix) {
	const gameWrapper = document.createElement('div');
	gameWrapper.classList.add('game-wrapper');

	for (let y = 0; y < matrix.length; y++) {
		const row = document.createElement('div')
		row.classList.add('row')
		gameWrapper.append(row)

		for (let x = 0; x < matrix[y].length; x++) {
			const point = matrix[y][x]
			const imgPoint = document.createElement('img')
			imgPoint.setAttribute('data-point-id', point.id)
			imgPoint.draggable = false
			imgPoint.oncontextmenu = () => false
			if (point.flag) {
				imgPoint.src = './assets/flag.png'
			} else if (point.light) {
				imgPoint.src = './assets/light.png'
			} else if (!point.show) {
				imgPoint.src = './assets/poten.png'
			} else if (point.mine) {
				imgPoint.src = './assets/mine.png'

			} else if (point.number && !(point.mine)) {
				imgPoint.src = `./assets/number${point.number}.png`
			} else {
				imgPoint.src = './assets/free.png'
			}
			imgPoint.classList.add('img-point')
			row.append(imgPoint)
		}
	}
	return gameWrapper;
}

function getPointId(matrix, id) {
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			const point = matrix[y][x]
			if (point.id === id) {
				return point
			}
		}
	}
	return false
}

function pointInfo(event) {
	const element = event.target;
	const elementId = parseInt(element.getAttribute('data-point-id'));
	return {
		left: event.which === 1,
		right: event.which === 3,
		pointId: getPointId(matrix, elementId)
	}
}

function update() {
	if (!start) {
		return
	}
	const game = gameBody(matrix);
	const gameField = document.querySelector('.game')
	gameField.innerHTML = ''
	gameField.append(game)
	game.querySelectorAll('img').forEach(imgPoint => {
		imgPoint.addEventListener('mousedown', mouseDown)
		imgPoint.addEventListener('mouseup', mouseUp)
		imgPoint.addEventListener('mouseleave', mouseLeave)
	})
	startTiming()
	if (isLoose(matrix)) {
		alert('You loose!')
		start = false

	}
	else if (isWin(matrix)) {
		const stop = Date.now()
		alert('You Win!!!')
		start = false
		progress(go, stop)
		addResult(name, delta)
	}

}

function showField(matrix, x, y) {
	const point = getPoint(matrix, x, y);
	if (point.mine || point.flag || point.number) {
		return
	}
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			const point = matrix[y][x]
			point._marker = false
		}
	}
	point._marker = true
	let open = true
	while (open) {
		open = false
		for (let y = 0; y < matrix.length; y++) {
			for (let x = 0; x < matrix[y].length; x++) {
				const cell = matrix[y][x]
				if (!cell._marker || cell.number) {
					continue
				}
				const cells = getAroundPoint(matrix, x, y)
				for (const cell of cells) {
					if (cell._marker) {
						continue
					}
					if (!cell.flag && !cell.mine) {
						cell._marker = true
						open = true
					}
				}
			}
		}
	}
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			const cell = matrix[y][x]
			if (cell._marker) {
				cell.show = true
			}
			delete cell._marker
		}
	}
}

function isLoose(matrix) {
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			const point = matrix[y][x]
			if (point.mine && point.show && !point.flag) {
				return true
			}
		}
	}
	return false
}
function isWin(matrix) {
	const mines = []
	const flags = []
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			const point = matrix[y][x]
			if (point.flag) {
				flags.push(point)
			}
			if (point.mine) {
				mines.push(point)
			}
		}
	}
	if (flags.length !== mines.length) {
		return false
	}
	for (const point of mines) {
		if (!point.flag) {
			return false
		}
	}
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			const point = matrix[y][x]
			if (!point.mine && !point.show) {
				return false
			}
		}
	}
	return true
}

function mouseDown(event) {
	const info = pointInfo(event)
	if (info.left) {
		info.pointId.left = true;
	}
	if (info.right) {
		info.pointId.right = true;
	}
	if (info.pointId.left && info.pointId.right) {
		bothClick(info.pointId)
	}
	update()
}

function mouseUp(event) {
	const info = pointInfo(event)
	const both = info.pointId.left && info.pointId.right && (info.left || info.right);
	const leftMouse = !both && info.pointId.left && info.left;
	const rightMouse = !both && info.pointId.right && info.right;

	if (both) {
		for (let y = 0; y < matrix.length; y++) {
			for (let x = 0; x < matrix[y].length; x++) {
				const point = matrix[y][x]
				point.light = false

			}
		}
	}
	if (info.left) {
		info.pointId.left = false;
	}
	if (info.right) {
		info.pointId.right = false;
	}
	if (leftMouse) {
		leftClick(info.pointId)
	}
	if (rightMouse) {
		rightClick(info.pointId)
	}
	update()
}

function mouseLeave(event) {
	const info = pointInfo(event)
	info.pointId.left = false;
	info.pointId.right = false;
	update()
}

function leftClick(pointId) {
	if (pointId.show || pointId.flag) {
		return
	}
	pointId.show = true
	showField(matrix, pointId.x, pointId.y)
}

function rightClick(pointId) {
	if (!pointId.show) {
		pointId.flag = !pointId.flag
	}

}

function bothClick(pointId) {
	if (!pointId.show || !pointId.number) {
		return
	}
	const points = getAroundPoint(matrix, pointId.x, pointId.y);
	const flags = points.filter(x => x.flag).length;

	if (flags === pointId.number) {
		points
			.filter(x => !x.flags && !x.show)
			.forEach(point => {
				point.show = true
				showField(matrix, point.x, point.y)
			})
	} else {
		points
			.filter(x => !x.flags && !x.show)
			.forEach(point => point.light = true)
	}
}




const easy = document.querySelector(".easy");
const medium = document.querySelector(".medium");
const hard = document.querySelector(".hard");

easy.addEventListener('click', () => {
	start = true
	matrix = getField(9, 9)
	for (let i = 0; i < 10; i++) {
		setMine(matrix)
	}
	update()
	detector = false;
})
medium.addEventListener('click', () => {
	start = true
	matrix = getField(16, 16)
	for (let i = 0; i < 40; i++) {
		setMine(matrix)
	}
	update()
	detector = false;
})
hard.addEventListener('click', () => {
	start = true
	matrix = getField(16, 30)
	for (let i = 0; i < 99; i++) {
		setMine(matrix)
	}
	update()
	detector = false;
})

function startTiming() {
	if (!detector) begin();
}

function begin() {
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			const point = matrix[y][x]
			if (point.show || point.flag) {
				go = Date.now()
				detector = true;
				return go
			}
		}
	}

}

function progress(go, stop) {
	delta = (Math.trunc(((stop - go) / 1000) * 100)) / 100
	return delta
}
let arr = []
function addResult(name, delta) {
	const list = document.querySelector(".list");
	let paragraph = document.createElement('option');
	paragraph.innerHTML = name + ' : ' + delta + 's'
	if (list.childNodes.length < 10) {
		list.appendChild(paragraph)
		arr.push(paragraph.innerHTML)
	} else if (list.childNodes.length >= 10) {
		list.appendChild(paragraph)
		arr.push(paragraph.innerHTML)
		list.childNodes[1].remove()
	}
	setLocalStorage(arr)
}

function setLocalStorage(arr) {
	if (arr.length > 0) {
		localStorage.setItem('arr', arr)
	}
}
let str = null
function getLocalStorage() {
	if (localStorage.getItem('arr')) {
		str = (localStorage.getItem('arr')).split(',');
	}
	const list = document.querySelector(".list");
	if (str) {
		for (let i = 0; i < str.length; i++) {
			const paragraph = document.createElement('option');
			paragraph.innerHTML = str[i]
			list.appendChild(paragraph)
		}
	}
}

window.addEventListener('load', getLocalStorage)