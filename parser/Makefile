CFLAGS = -Wall -g -std=c11
BIN = bin/
INC = include/
SRC = src/
XML_PATH = /usr/include/libxml2

# Standard common makefile
parser: $(BIN)libsvgparse.so

$(BIN)libsvgparse.so: $(BIN)SVGParser.o $(BIN)LinkedListAPI.o
	gcc -shared -o ../libsvgparse.so $(BIN)SVGParser.o $(BIN)LinkedListAPI.o -lxml2 -lm

$(BIN)SVGParser.o: $(SRC)SVGParser.c $(INC)LinkedListAPI.h $(INC)SVGParser.h
	gcc -c -fpic $(CFLAGS) -I$(XML_PATH) -I$(INC) $(SRC)SVGParser.c -o $(BIN)SVGParser.o

$(BIN)LinkedListAPI.o: $(SRC)LinkedListAPI.c $(INC)LinkedListAPI.h
	gcc -c -fpic $(CFLAGS) -I$(INC) $(SRC)LinkedListAPI.c -o $(BIN)LinkedListAPI.o


$(BIN)main.o: parser
	gcc $(CFLAGS) src/newMain.c -lsvgparse -lxml2 -Lbin -Iinclude -I$(XML_PATH) -o bin/main
run:  $(BIN)main.o
	./bin/main  <JSONTEST.txt
memtest: $(BIN)main.o
	valgrind --leak-check=full ./bin/main <JSONTEST.txt

clean:
	rm $(BIN)*.o $(BIN)*.so
