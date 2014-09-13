TEST_FILES = $(shell find test -name '*.ls')

include node_modules/make-livescript/livescript.mk

test: all $(TEST_FILES)
	node_modules/.bin/mocha -r LiveScript -u exports $(TEST_FILES)