SRC    := $(wildcard src/*.js)
ASSETS := $(patsubst assets/%,dist/%,$(wildcard assets/*))

.PHONY: all
all: dist/index.html $(ASSETS)

dist/index.html: src/index.html dist/index.js
	sed '\#<script data-src="index.js">#r dist/index.js' src/index.html > dist/index.html

dist/index.js: $(SRC)
	mkdir -p dist/
	deno bundle src/index.js dist/index.js

dist/%: assets/%
	mkdir -p dist/
	cp $^ $@

.PHONY: host
host: dist/index.html dist/
	(cd dist; python3 -m http.server)

.PHONY: ipfs
ipfs: dist/index.html
	echo "TODO"
	exit 1
	#curl -X POST -F file=@dist/index.html "https://ipfs.infura.io:5001/api/v0/add?pin=true"

.PHONY: clean
clean:
	rm -rf dist/
