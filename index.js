class Vec2 {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
	dist(vec) {
		return Math.hypot(
			this.x - vec.x, 
			this.y - vec.y
		)
	}
	len() {
		return Math.hypot(
			this.x,
			this.y
		)
	}
	angle() {
		let angle = Math.atan(this.y / this.x)
		if (this.x < 0) {
			angle += Math.PI
		} else if (this.x > 0 && this.y < 0) {
			angle += Math.PI * 2
		}
		return (angle + Math.PI * 2) % (Math.PI * 2)
	}
	rotate(angle) {
		let vec = new Vec2(this.x, this.y)
		let ca = Math.cos(angle)
		let sa = Math.sin(angle)
		vec.x = vec.x * ca - vec.y * sa
		vec.y = vec.x * sa + vec.y * ca
		return vec
	}
	add(vec) {
		this.x += vec.x
		this.y += vec.y
		return this
	}
	sub(vec) {
		this.x -= vec.x
		this.y -= vec.y
		return this
	}
	invert() {
		this.x = -this.x
		this.y = -this.y
		return this
	}
	clone() {
		return new Vec2(this.x, this.y)
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
	draw1() {
		const rays = getRays()
		for (let ri = 0; ri < rays.length; ri++) {
			drawLine(this.pos, rays[ri], 4)
		}
	}
	draw() {
		ctx.beginPath()
		const rays = getRays()
		for (let ri = 0; ri < rays.length; ri++) {
			if (!ri) {
				ctx.moveTo(rays[ri].x, rays[ri].y)
			} else {
				ctx.lineTo(rays[ri].x, rays[ri].y)
			}
		}
		ctx.closePath()
		let gradient = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, 300)
		gradient.addColorStop(0, "yellow")
		gradient.addColorStop(1, "black")
		ctx.fillStyle = gradient
		ctx.fill()
	}
}

function intersects(v1, v2, v3, v4) {
	const D = (v1.x - v2.x) * (v3.y - v4.y) - (v1.y - v2.y) * (v3.x - v4.x)
	if (D === 0) {
		//	parallel
		return false
	}
	const t = ((v1.x - v3.x) * (v3.y - v4.y) - (v1.y - v3.y) * (v3.x - v4.x)) / D
	const u = ((v2.x - v1.x) * (v1.y - v3.y) - (v2.y - v1.y) * (v1.x - v3.x)) / D

	if (t < 0 || t > 1 || u < 0) {
		//	not intersecting
		return false
	}
	//	intersection
	const intersection = new Vec2(
		v1.x + t * (v2.x - v1.x),
		v1.y + t * (v2.y - v1.y)
	)
	intersection.t = t
	intersection.u = u
	return intersection
}

function getRays() {
	let rays = []
	for (let vi = 0; vi < vertices.length; vi++) {
		let intersection
		for (let wi = 0; wi < walls.length; wi++) {
			const test = intersects(
				walls[wi].a,
				walls[wi].b,
				ls.pos,
				vertices[vi]
			)
			if (test && (!intersection || test.u < intersection.u)) {
				test.wall = wi
				intersection = test
			}
		}
		if (intersection) {
			rays.push(intersection)
		}
	}
	for (let ri = 0; ri < rays.length; ri++) {
		rays[ri] = rays[ri].sub(ls.pos)
		rays[ri].dir = rays[ri].angle()
	}
	rays.sort((a, b) => a.dir - b.dir)
	const filtered = []
	for (let i = 0; i < rays.length; i++) {
		const next = (rays.length + i + 1) % rays.length
		const prev = (rays.length + i - 1) % rays.length
		if (rays[prev].wall !== rays[i].wall || rays[next].wall !== rays[i].wall) {
			filtered.push(rays[i].add(ls.pos))
		}
	}
	return filtered
}

function getVertices() {
	const vertices = []
	const variation = 0.00001
	walls.forEach(wall => {
		if (!vertices.find(v => (v.x === wall.a.x && v.y === wall.a.y))) {
			vertices.push(wall.a.clone().sub(ls.pos).rotate(-variation).add(ls.pos))
			vertices.push(wall.a)
			vertices.push(wall.a.clone().sub(ls.pos).rotate(variation).add(ls.pos))
		}
		if (!vertices.find(v => (v.x === wall.b.x && v.y === wall.b.y))) {
			vertices.push(wall.b.clone().sub(ls.pos).rotate(-variation).add(ls.pos))
			vertices.push(wall.b)
			vertices.push(wall.b.clone().sub(ls.pos).rotate(variation).add(ls.pos))
		}
	})
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

function drawLine(a, b, color = 1) {
	ctx.beginPath()
	ctx.moveTo(a.x, a.y)
	ctx.lineTo(b.x, b.y)
	ctx.strokeStyle = tiles.colors[color]
	ctx.lineWidth = 1
	ctx.stroke()
	drawPoint(a, color)
	drawPoint(b, color)
}

function drawPoint(p, color = 1, r = 2) {
	ctx.beginPath()
	ctx.arc(p.x, p.y, r, 0, 2 * Math.PI, false)
	ctx.fillStyle = tiles.colors[color]
	ctx.fill()
}

function draw() {
	ctx.fillStyle = "black"
	ctx.fillRect(0, 0, cnv.width, cnv.height)
	walls.forEach(wall => {
		wall.draw()
	})
	ls.draw()
	// ls.draw1()
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
	colors: ["white", "black", "blue", "green", "red", "brown", "magenta", "cyan", "yellow"]
}
const maps = [
	[
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
	], [
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
	], [
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,7,7,7,7,7,7,7,7],
		[4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,7],
		[4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
		[4,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
		[4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,7],
		[4,0,4,0,0,0,0,5,5,5,5,5,5,5,5,5,7,7,0,7,7,7,7,7],
		[4,0,0,0,0,0,0,5,0,5,0,5,0,5,0,5,7,0,0,0,7,7,7,1],
		[4,0,6,0,0,0,0,5,0,0,0,0,0,0,0,5,7,0,0,0,0,0,0,8],
		[4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,1],
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
]

const map = maps[0]

const walls = []
convertMap()
const ls = new LightSource(150, 300)
const vertices = getVertices(walls)

cnv.addEventListener("mousemove", e => {
	ls.setPos(e.offsetX, e.offsetY)
	draw()
})

draw()