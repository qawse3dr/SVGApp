#include "SVGParser.h"
#include <assert.h>

//Test harness
int main(){

    SVGimage* img = NULL;
    char* imageString = NULL;
    int rectCount;
    Rectangle* rect;
    List* list;
    printf("Acessing a image that doesnt exist\n");
    img = createValidSVGimage("notAFile.svg","testFiles/svg.xsd");
    assert(img == NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");


    printf("NULL as file name\n");
    img = createValidSVGimage(NULL,"testFiles/svg.xsd");
    assert(img == NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");


    printf("NULL as schema\n");
    img = createValidSVGimage(NULL,NULL);
    assert(img == NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");

    printf("NULL as schema\n");
    img = createValidSVGimage("testFiles/Emoji_poo.svg",NULL);
    assert(img == NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");

    printf("test quad\n");
    img = createValidSVGimage("testFilesA2/quad01_A2.svg","testFilesA2/svg.xsd");
    assert(img != NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");
    deleteSVGimage(img);

    printf("invalid schema and file name\n");
    img = createValidSVGimage("testFiles/Emoji_poo.svg","not a schema.xsd");
    assert(img == NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");

    printf("Acessing a image that is not valid xml\n");
    img = createValidSVGimage("testFiles/broken.svg","testFiles/svg.xsd");
    assert(img == NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");

    printf("Opening valid svg file rect width Units\n");
    img = createValidSVGimage("testFiles/rec_with_units.svg","testFiles/svg.xsd");
    assert(img != NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");

    printf("Testing nameSpace\n");
    assert(strcmp(img->namespace,"http://www.w3.org/2000/svg") == 0);
    printf("\033[32m" "\tPASS\n" "\033[0m");

    printf("Testing title\n");
    assert(strcmp(img->title,"Example rect - simple revctange wiuth units") == 0);
    printf("\033[32m" "\tPASS\n" "\033[0m");

    printf("Testing description\n");
    assert(strcmp(img->description,"") == 0);
    printf("\033[32m" "\tPASS\n" "\033[0m");


    printf("Converting image to string\n");
    imageString = SVGimageToString(img);
    assert(imageString != NULL);
    if(imageString){
      printf("%s\n",imageString);

    }
    if(imageString){
      free(imageString);
    }
    printf("\033[32m" "\tPASS\n" "\033[0m");



    printf("Testing rect count... with 285\n");
    rectCount = numRectsWithArea(img,285);
    assert(rectCount == 1);
    printf("\033[32m" "\tPASS: 1 rect found\n" "\033[0m");

    printf("Testing rect count... with 284\n");
    rectCount = numRectsWithArea(img,284);
    assert(rectCount == 0);
    printf("\033[32m" "\tPASS: 0 rect found\n""\033[0m");

    //tests first rect to see units
    printf("testing rect\n");
    list = getRects(img);
    rect = (Rectangle*)getFromFront(list);
    assert(strcmp(rect->units,"cm") == 0);
    printf("\033[32m" "\tPass: UNITS\n""\033[0m");
    assert(rect->x == 1 && rect->y == 1);
    printf("\033[32m" "\tPass: x and y\n""\033[0m");
    assert(getLength(rect->otherAttributes) == 3);
    printf("\033[32m" "\tPass: otherAttributes length\n""\033[0m");
    freeList(list);

    printf("num of attributes %d\n",numAttr(img));
    assert(numAttr(img) == 7);
    printf("\033[32m" "\tPASS: attribute length\n""\033[0m");

    //testing that all other lists exist but are empty
    printf("Checking that other list exist but are empty\n");
    printf("Circles\n");
    list = getCircles(img);
    assert(getLength(list) == 0);
    freeList(list);
    printf("\033[32m" "\tPASS:Circles\n""\033[0m");

    printf("paths\n");
    list = getPaths(img);
    assert(getLength(list) == 0);
    freeList(list);
    printf("\033[32m" "\tPASS:paths\n""\033[0m");

    printf("Groups\n");
    list = getGroups(img);
    assert(getLength(list) == 0);
    freeList(list);
    printf("\033[32m" "\tPASS:groups\n""\033[0m");


    deleteSVGimage(img);




    printf("Passing NULL to all functions\n");
    printf("if it doesnt crash it passes\n");
    SVGimageToString(NULL);
    deleteSVGimage(NULL);
    getRects(NULL);
    getCircles(NULL);
    getGroups(NULL);
    getPaths(NULL);
    assert(numRectsWithArea(NULL,0) == 0);
    assert(numCirclesWithArea(NULL,0) == 0);
    assert(numPathsWithdata(NULL,NULL) == 0);
    assert(numGroupsWithLen(NULL,0) == 0);
    assert(numAttr(NULL) == 0);
    deleteAttribute(NULL);
    attributeToString(NULL);
    compareAttributes(NULL,NULL);
    deleteGroup(NULL);
    groupToString(NULL);
    compareGroups(NULL,NULL);
    deleteRectangle(NULL);
    rectangleToString(NULL);
    compareRectangles(NULL,NULL);
    deleteCircle(NULL);
    circleToString(NULL);
    compareCircles(NULL,NULL);
    deletePath(NULL);
    pathToString(NULL);
    comparePaths(NULL,NULL);

    assert(!writeSVGimage(NULL,"fileName"));
    img = createValidSVGimage("A2-moreTest/rects.svg","testFilesA2/svg.xsd");
    Attribute* attr = malloc(sizeof(Attribute));
    attr->name = malloc(sizeof("fucker"));
    attr->value = malloc(sizeof("ducker"));
    strcpy(attr->name,"fucker");
    strcpy(attr->value,"ducker");
    assert(!writeSVGimage(img,NULL));
    assert(!writeSVGimage(NULL,NULL));

    //checks if the attribute number changes which it shouldnt
    int attrNumber = numAttr(img);
    setAttribute(img,RECT,0,NULL);
    assert(attrNumber == numAttr(img));
    setAttribute(img,RECT,-1,attr);
    assert(attrNumber == numAttr(img));
    setAttribute(img,RECT,9999,attr);
    assert(attrNumber == numAttr(img));
    setAttribute(img,6,0,attr);
    assert(attrNumber == numAttr(img));
    free(attr->name);
    attr->name = NULL;
    setAttribute(img,RECT,0,attr);
    assert(attrNumber == numAttr(img));
    attr->name = attr->value;
    attr->value = NULL;
    setAttribute(img,RECT,0,attr);
    assert(attrNumber == numAttr(img));

    printf("Adding an attribute shouldnt have errors\n");
    attr->value = malloc(sizeof("ducker"));
    strcpy(attr->value,"fucker");
    setAttribute(img,RECT,0,attr);
    assert(attrNumber == numAttr(img)-1);
    assert(!validateSVGimage(img,"testFIlesA2/svg.xsd")); //attribute not valid should fail
    deleteSVGimage(img);

    printf("Opening valid svg file Emoji_poo\n");
    img = createValidSVGimage("testFiles/Emoji_poo.svg","testFiles/svg.xsd");
    assert(img != NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");
        writeSVGimage(img,"test.svg");

        assert(validateSVGimage(img,"testFiles/svg.xsd"));
    printf("\033[32m" "\tPASS\n""\033[0m");

    printf("passing invalid values to getwidth function\n");
    assert(!numRectsWithArea(img,-1));
    assert(!numCirclesWithArea(img,-1));
    assert(!numPathsWithdata(img,""));
    assert(!numGroupsWithLen(img,-1));

    printf("\033[32m" "\tPASS\n""\033[0m");

    printf("Testing and printing SVGimageToString\n");
    imageString = SVGimageToString(img);
        printf("%s\n",imageString);
    assert(imageString != NULL);
    free(imageString);
    printf("\033[32m" "\tPASS\n""\033[0m");

    printf("Rects count\n");
    list = getRects(img);
    assert(!getLength(list));
    freeList(list);

    printf("paths count\n");
    list = getPaths(img);
    assert(getLength(list) == 6);
    freeList(list);

    printf("Circles count\n");
    list = getCircles(img);
    assert(getLength(list) == 2);
    freeList(list);

    printf("groups count\n");
    list = getGroups(img);
    assert(getLength(list) == 1);
    freeList(list);

    printf("DELETE svg\n");
    deleteSVGimage(img);



    printf("Opening valid svg .svg\n");
    img = createValidSVGimage("testFiles/test.svg","testFiles/svg.xsd");
    assert(img != NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");
    writeSVGimage(img,"test.svg");
    //assert(validateSVGimage(img,"testFiles/svg.xsd") == false);

    deleteSVGimage(img);

    printf("Opening valid svg .svg\n");
    img = createValidSVGimage("testFilesA2/Emoji_grinning.svg","testFiles/svg.xsd");
    assert(img != NULL);
    printf("\033[32m" "\tPASS\n" "\033[0m");
    Attribute* attribute = malloc(sizeof(Attribute));
    attribute->name = malloc(sizeof(char)*(strlen("fillmka")+1));
    strcpy(attribute->name,"fill");
    attribute->value = malloc(sizeof(char)*(strlen("#111111")+1));
    strcpy(attribute->value,"#111111");
    setAttribute(img,PATH,3,attribute);

    Circle* circle = malloc(sizeof(Circle));
    circle->cx = 10;
    circle->cy = 100;
    circle->r = 30;
    strcpy(circle->units,"cm");
    circle->otherAttributes = initializeList(attributeToString,deleteAttribute,compareAttributes);
    char* circleString = circleToJSON(circle);
    printf("%s\n",circleString);
    free(circleString);
    addComponent(img,CIRC,circle);

    Rectangle* rect2= malloc(sizeof(Rectangle));
    rect2->x = 123;
    rect2->y = 50;
    rect2->width = 30;
    rect2->height = 3;
    strcpy(rect2->units,"cm");
    rect2->otherAttributes = initializeList(attributeToString,deleteAttribute,compareAttributes);
    addComponent(img,RECT,rect2);

    Attribute* attribute2 = malloc(sizeof(Attribute));
    attribute2->name = malloc(sizeof(char)*(strlen("width")+1));
    strcpy(attribute2->name,"width");
    attribute2->value = malloc(sizeof(char)*(strlen("#111111")+1));
    strcpy(attribute2->value,"420");
    setAttribute(img,RECT,0,attribute2);

    Attribute* attribute3 = malloc(sizeof(Attribute));
    attribute3->name = malloc(sizeof(char)*(strlen("stroke")+1));
    strcpy(attribute3->name,"stroke");
    attribute3->value = malloc(sizeof(char)*(strlen("#111111")+1));
    strcpy(attribute3->value,"#696969");
    setAttribute(img,GROUP,20,attribute3);
    deleteAttribute(attribute3);
        writeSVGimage(img,"test.svg");
    assert(validateSVGimage(img,"testFiles/svg.xsd")  == true);


    deleteSVGimage(img);


    printf("Opening valid svg .svg\n");
    img = createValidSVGimage("testFilesA2/Emoji_grinning.svg","testFiles/svg.xsd");
    assert(img != NULL);
    char* svgString = SVGtoJSON(img);
    printf("%s\n",svgString);
    free(svgString);
    deleteSVGimage(img);
    printf("testomg JsontoSVG\n");
    img = JSONtoSVG("{\"title\":\"testTitle\",\"descr\":50}");
    Path* path = malloc(sizeof(Path));
    path->data = malloc(sizeof(char)*strlen("M200,300 L400,50 L600,300 L800,550 L1000,300M 200,300 L400,50 L600,300 L800,550 L1000,300") + 1);
    path->otherAttributes = initializeList(attributeToString,deleteAttribute,compareAttributes);
    strcpy(path->data,"M200,300 L400,50 L600,300 L800,550 L1000,300M 200,300 L400,50 L600,300 L800,550 L1000,300");
    addComponent(img,PATH,path);
    attribute = malloc(sizeof(Attribute));
    attribute->name = malloc(sizeof(char)*(strlen("fillmka")+1));
    strcpy(attribute->name,"fill");
    attribute->value = malloc(sizeof(char)*(strlen("#111111")+1));
    strcpy(attribute->value,"#111111");
    setAttribute(img,PATH,0,attribute);
    imageString = SVGimageToString(img);

    char* jsonString = pathToJSON(path);
    printf("%s\n",jsonString);
    printf("testings for truncation path must be cut off after 64 chars");
    assert(strcmp("{\"d\":\"M200,300 L400,50 L600,300 L800,550 L1000,300M 200,300 L400,50 L6\",\"numAttr\":1}" ,jsonString) == 0);
    free(jsonString);
    printf("%s\n",imageString);
    free(imageString);
    deleteSVGimage(img);

    printf("testomg JsontoCIRCLE\n");
    Circle* cir = JSONtoCircle("{\"cx\":32,\"cy\":\"fuck\",\"r\":30,\"units\":\"fuck\"}");
    if(cir){
      imageString = circleToString(cir);
      printf("%s\n",imageString);
      free(imageString);
      deleteCircle(cir);

    } else{
      printf("invalid Cirlce\n");
    }


    printf("testomg JsontoRect\n");
    rect = JSONtoRect("{\"x\":5,\"y\":-1,\"w\":19,\"h\":333333333333333333333333333333,\"units\":\"cm\"}");
    if(rect){
        imageString = rectangleToString(rect);
        printf("%s\n",imageString);
        free(imageString);
        deleteRectangle(rect);
    } else {
        printf("Invalid Rect\n");
    }

    //gonna try and break stuff
    addComponent(NULL,100,NULL);


    printf("Reading in SVG from A2-moreTest and outputing files to A2-moreTestOutput\n");
    printf("Please make sure they were all copied corectly\n");

    printf("Beer\n");
    img = createValidSVGimage("A2-moreTest/beer.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/beer.svg");
    deleteSVGimage(img);

    printf("grinning\n");
    img = createValidSVGimage("A2-moreTest/Emoji_grinning.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/Emoji_grinning.svg");
    deleteSVGimage(img);

    printf("Party\n");
    img = createValidSVGimage("A2-moreTest/Emoji_party_A2.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/Emoji_party_A2.svg");
    deleteSVGimage(img);

    printf("poo\n");
    img = createValidSVGimage("A2-moreTest/Emoji_poo_A2.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/Emoji_poo_A2.svg");
    deleteSVGimage(img);

    printf("shades\n");
    img = createValidSVGimage("A2-moreTest/Emoji_shades.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/Emoji_shades.svg");
    deleteSVGimage(img);

    printf("smile\n");
    img = createValidSVGimage("A2-moreTest/Emoji_smiling.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/Emoji_smiling.svg");
    deleteSVGimage(img);

    printf("thumb\n");
    img = createValidSVGimage("A2-moreTest/Emoji_thumb.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/Emoji_thumb.svg");
    deleteSVGimage(img);

    printf("hen\n");
    img = createValidSVGimage("A2-moreTest/hen_and_chicks.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/hen_and_chicks.svg");
    deleteSVGimage(img);

    printf("quad01\n");
    img = createValidSVGimage("A2-moreTest/quad01_A2.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/quad01_A2.svg");
    deleteSVGimage(img);

    printf("rects\n");
    img = createValidSVGimage("A2-moreTest/rects.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/rects.svg");
    deleteSVGimage(img);

    printf("rects_GG\n");
    img = createValidSVGimage("A2-moreTest/rects_gg.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/rects_gg.svg");
    deleteSVGimage(img);

    printf("satis_tities\n");
    img = createValidSVGimage("A2-moreTest/satisfaction.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/rsatisfaction.svg");
    deleteSVGimage(img);

    printf("vest\n");
    img = createValidSVGimage("A2-moreTest/vest.svg","testFilesA2/svg.xsd");
    writeSVGimage(img,"A2-moreTestOutput/vest.svg");
    deleteSVGimage(img);

    printf("Adding broken components USES JSON to test so have bonus funcitons done\n");
    img = createValidSVGimage("A2-moreTest/Emoji_smiling.svg","testFilesA2/svg.xsd");
     cir = JSONtoCircle("{\"cx\":1,\"cy\":\"10\",\"r\":2,\"units\":\"cm\"}");
     if(cir){
         //breaks circle shouldnt be added to image
         int num = numCirclesWithArea(img,13);
         freeList(cir->otherAttributes);
         cir->otherAttributes = NULL;
         printf("adding component shouldnt be added\n");
         addComponent(img,CIRC,cir);
         assert(num == numCirclesWithArea(img,13));
         deleteCircle(cir);
         printf("\t adding a valid circle to a list should be added");
         cir = JSONtoCircle("{\"cx\":1,\"cy\":\"10\",\"r\":2,\"units\":\"cm\"}");
         addComponent(img,CIRC,cir);
         assert(num + 1 == numCirclesWithArea(img,13));
         printf("trying to add an attribute to a list that doesnt exists\n");
         //breaks circle in svg
         freeList(cir->otherAttributes);
         cir->otherAttributes = NULL;
         //creats attribute
         attribute = malloc(sizeof(Attribute));
         attribute->name = malloc(sizeof(char)*(strlen("fillmka")+1));
         strcpy(attribute->name,"fill");
         attribute->value = malloc(sizeof(char)*(strlen("#111111")+1));
         strcpy(attribute->value,"#111111");
         int Acount = numAttr(img);
         setAttribute(img,CIRC,1,attribute);
         assert(Acount == numAttr(img));
         printf("writing image to make sure new component was added\n");
         writeSVGimage(img,"A2-moreTestOutput/addingCircle.svg");
         SVGimage* img2 = createValidSVGimage("A2-moreTestOutput/addingCircle.svg","testFilesA2/svg.xsd");
         //checking to make sure circle was added
         assert(num + 1 == numCirclesWithArea(img2,13));

         //testing list to json empty list.

         //freeing memory assumed to work
         deleteSVGimage(img2);
         deleteAttribute(attribute);
     }else {
         printf("your json is broken please fix before continuing test");

     }
     deleteSVGimage(img);

     img = JSONtoSVG("{\"title\":\"testTitle\",\"descr\":50}");
     printf("testing empty lists in jsonToLISTS shit\n");
     char* string = attrListToJSON(img->otherAttributes);
     assert(strcmp(string,"[]") == 0);
     free(string);
     string = circListToJSON(img->circles);
     assert(strcmp(string,"[]") == 0);
     free(string);
     string = rectListToJSON(img->rectangles);
     assert(strcmp(string,"[]") == 0);
     free(string);
     string = pathListToJSON(img->paths);
     assert(strcmp(string,"[]") == 0);
     free(string);
     string = groupListToJSON(img->groups);
     assert(strcmp(string,"[]") == 0);
     free(string);

     printf("passes NULL to LIST to JSON\n");
     string = attrListToJSON(NULL);
    assert(strcmp(string,"[]") == 0);
    free(string);
    string = circListToJSON(NULL);
    assert(strcmp(string,"[]") == 0);
    free(string);
    string = rectListToJSON(NULL);
    assert(strcmp(string,"[]") == 0);
    free(string);
    string = pathListToJSON(NULL);
    assert(strcmp(string,"[]") == 0);
    free(string);
    string = groupListToJSON(NULL);
    assert(strcmp(string,"[]") == 0);
    free(string);

    deleteSVGimage(img);

    printf("passes NULL to JSON\n");
    string = attrToJSON(NULL);
   assert(strcmp(string,"{}") == 0);
   free(string);
   string = circleToJSON(NULL);
   assert(strcmp(string,"{}") == 0);
   free(string);
   string = rectToJSON(NULL);
   assert(strcmp(string,"{}") == 0);
   free(string);
   string = pathToJSON(NULL);
   assert(strcmp(string,"{}") == 0);
   free(string);
   string = groupToJSON(NULL);
   assert(strcmp(string,"{}") == 0);
   free(string);

  char buffer[10000];
  img = createValidSVGimage("A2-moreTest/quad01_A2.svg","testFilesA2/svg.xsd");
  list = getRects(img);
  string = rectListToJSON(list);
    fgets(buffer,10000,stdin);
    buffer[strlen(buffer)-1] = '\0';


  assert(strcmp(buffer,string) == 0);
  free(string);
  freeList(list);

  list = getCircles(img);
 string = circListToJSON(list);
    fgets(buffer,10000,stdin);
        buffer[strlen(buffer)-1] = '\0';
    printf("%s\n%s\n",buffer,string);
 assert(strcmp(buffer,string) == 0);

   free(string);
  freeList(list);

  list = getPaths(img);
    string = pathListToJSON(list);
    fgets(buffer,10000,stdin);
        buffer[strlen(buffer)-1] = '\0';
      printf("%s\n%s\n",buffer,string);
    assert(strcmp(buffer,string) == 0);
      free(string);
  freeList(list);

  list = getGroups(img);
string = groupListToJSON(list);
fgets(buffer,10000,stdin);
    buffer[strlen(buffer)-1] = '\0';
assert(strcmp(buffer,string) == 0);

  free(string);
  freeList(list);


  //sets SVGTOIMG
  string = SVGtoJSON(img);
  fgets(buffer,10000,stdin);
      buffer[strlen(buffer)-1] = '\0';
  assert(strcmp(buffer,string) == 0);
  printf("%s\n",string);
  free(string);
  deleteSVGimage(img);
    printf("Freeing memory use valgrind to check for leaks\n");
    return 0;
}
