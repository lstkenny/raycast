class Vec2 {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
}

class Wall {
	constructor(x1, y1, x2, y2, tile) {
		this.a = new Vec2(x1, y1)
		this.b = new Vec2(x2, y2)
		this.tile = tile
	}
	draw() {
		drawLine(this.a, this.b, this.tile)
	}
}

class LightSource {
	constructor(x, y) {
		this.pos = new Vec2(x, y)
	}
	setPos(x, y) {
		this.pos.x = x
		this.pos.y = y
	}
	draw() {
		vertices.forEach(v => {
			const ray = new Vec2(this.pos.x + v.x, this.pos.y + v.y)
			walls.forEach(wall => {
				
			})
		})
	}
}

function getVertices() {
	const vertices = []
	walls.forEach(wall => {
		if (!vertices.find(v => (v.x === wall.a.x && v.y === wall.a.y))) {
			vertices.push(wall.a)
		}
		if (!vertices.find(v => (v.x === wall.b.x && v.y === wall.b.y))) {
			vertices.push(wall.b)
		}
	})
	console.log(vertices.length)
	return vertices
}

function pushWall(x1, y1, x2, y2, tile) {
	for (let i = 0; i < walls.length; i++) {
		if (walls[i].tile === tile //	same tile
			&& walls[i].b.x === x1 && walls[i].b.y === y1 //	continue wall
			&& (walls[i].a.x === x2 || walls[i].a.y === y2) //	straight line
		) {
			walls[i].b.x = x2
			walls[i].b.y = y2
			return
		}
	}
	walls.push(new Wall(x1, y1, x2, y2, tile))
}

function getWalls(col, row, tile) {
	if (tile === 0) {
		return
	}
	//	top neighbor
	if (typeof map[row - 1] === "undefined" || map[row - 1][col] !== tile) {
		pushWall(
			col * tiles.width,
			row * tiles.height,
			col * tiles.width + tiles.width,
			row * tiles.height,
			tile
		)
	}
	// left neighbor
	if (typeof map[row][col - 1] === "undefined" || map[row][col - 1] !== tile) {
		pushWall(
			col * tiles.width,
			row * tiles.height, 
			col * tiles.width,
			row * tiles.height + tiles.height,
			tile
		)
	}
	//	right neighbor
	if (typeof map[row][col + 1] === "undefined" || map[row][col + 1] !== tile) {
		pushWall(
			col * tiles.width + tiles.width,
			row * tiles.height,
			col * tiles.width + tiles.width,
			row * tiles.height + tiles.height,
			tile
		)
	}
	//	bottom neighbor
	if (typeof map[row + 1] === "undefined" || map[row + 1][col] !== tile) {
		pushWall(
			col * tiles.width,
			row * tiles.height + tiles.height,
			col * tiles.width + tiles.width,
			row * tiles.height + tiles.height,
			tile
		)
	}
}

function convertMap() {
	map.forEach((rows, row) => {
		rows.forEach((tile, col) => {
			getWalls(col, row, tile)
		})
	})
}

function drawLine(a, b, color) {
	ctx.beginPath()
	ctx.moveTo(a.x, a.y)
	ctx.lineTo(b.x, b.y)
	ctx.strokeStyle = tiles.colors[color]
	ctx.lineWidth = 1
	ctx.stroke()
	ctx.beginPath()
	ctx.arc(a.x, a.y, 2, 0, 2 * Math.PI, false)
	ctx.arc(b.x, b.y, 2, 0, 2 * Math.PI, false)
	ctx.fillStyle = tiles.colors[color]
	ctx.fill()
}

function drawTile(x, y, tile) {
	ctx.fillStyle = tiles.colors[tile]
	ctx.fillRect(
		x * tiles.width, 
		y * tiles.height, 
		tiles.width, 
		tiles.height)
}

function drawMap() {
	map.forEach((rows, row) => {
		rows.forEach((tile, col) => {
			if (tile > 0) {
				drawTile(col, row, tile)
			}
		})
	})
}

function draw() {
	ctx.clearRect(0, 0, cnv.width, cnv.height)
	// drawMap()
	walls.forEach(wall => {
		wall.draw()
	})
	ls.draw(walls)
}

// create canvas
const cnv = document.createElement("canvas")
cnv.width = 600
cnv.height = 600
const ctx = cnv.getContext("2d")
document.body.appendChild(cnv)

const tiles = {
	width: 25,
	height: 25,
	colors: ["white", "black", "blue", "green", "red", "purple", "magenta", "cyan", "yellow"]
}
const map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]
const map2 = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
	[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
	[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,1],
	[1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,7,0,0,0,0,1],
	[1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,7,0,0,0,0,1],
	[1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,7,0,0,0,0,1],
	[1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,7,0,0,0,0,1],
	[1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

const map1 = [
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,7,7,7,7,7,7,7,7],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,7],
  [4,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
  [4,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
  [4,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,7],
  [4,0,4,0,0,0,0,5,5,5,5,5,5,5,5,5,7,7,0,7,7,7,7,7],
  [4,0,5,0,0,0,0,5,0,5,0,5,0,5,0,5,7,0,0,0,7,7,7,1],
  [4,0,6,0,0,0,0,5,0,0,0,0,0,0,0,5,7,0,0,0,0,0,0,8],
  [4,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,1],
  [4,0,8,0,0,0,0,5,0,0,0,0,0,0,0,5,7,0,0,0,0,0,0,8],
  [4,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,7,0,0,0,7,7,7,1],
  [4,0,0,0,0,0,0,5,5,5,5,0,5,5,5,5,7,7,7,7,7,7,7,1],
  [6,6,6,6,6,6,6,6,6,6,6,0,6,6,6,6,6,6,6,6,6,6,6,6],
  [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [6,6,6,6,6,6,0,6,6,6,6,0,6,6,6,6,6,6,6,6,6,6,6,6],
  [4,4,4,4,4,4,0,4,4,4,6,0,6,2,2,2,2,2,2,2,3,3,3,3],
  [4,0,0,0,0,0,0,0,0,4,6,0,6,2,0,0,0,0,0,2,0,0,0,2],
  [4,0,0,0,0,0,0,0,0,0,0,0,6,2,0,0,5,0,0,2,0,0,0,2],
  [4,0,0,0,0,0,0,0,0,4,6,0,6,2,0,0,0,0,0,2,2,0,2,2],
  [4,0,6,0,6,0,0,0,0,4,6,0,0,0,0,0,5,0,0,0,0,0,0,2],
  [4,0,0,5,0,0,0,0,0,4,6,0,6,2,0,0,0,0,0,2,2,0,2,2],
  [4,0,6,0,6,0,0,0,0,4,6,0,6,2,0,0,5,0,0,2,0,0,0,2],
  [4,0,0,0,0,0,0,0,0,4,6,0,6,2,0,0,0,0,0,2,0,0,0,2],
  [4,4,4,4,4,4,4,4,4,4,1,1,1,2,2,2,2,2,2,3,3,3,3,3]
]

const walls = []
convertMap()
const vertices = getVertices(walls)

const ls = new LightSource(cnv.width / 2, cnv.height / 2)
cnv.addEventListener("click", e => {
	ls.setPos(e.offsetX, e.offsetY)
	draw()
})

draw()