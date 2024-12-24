install:
	docker run --rm -w /app -u `id -u`:`id -g` -v .:/app node:23.5.0 npm install

up:
	docker run --rm -d --name yii3-landing -w /app -u `id -u`:`id -g` -v .:/app -p 3000:3000 node:23.5.0 npm run dev -- --host=0.0.0.0 --port=3000

down:
	docker stop yii3-landing
