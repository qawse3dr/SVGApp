/*
*Name: Lawrence Milne
*STD NUM: 1044930
*email: lmilne01
*/


/** ALL utility functions will go in here*/
#include "SVGParser.h"


#ifndef UTIL_H
#define UTIL_H
/*Creates The skelaton of the image including blank lists and names
 *@pre newly malloced image
 *@param SVGimage* img: the image that is being initlized
 */
void initImage(SVGimage* img);


//repersents a number with a unit
typedef struct {

  //the value of type unit
  float value;
  //unit name
  char unit[50];
}Quantity;

/**takes in a quantity as a string and returns it as a struct
 *@pre if a NULL string is given will return null. assuming string is valid
 *@param num the quantity being parsed
 *@return the quantity as a struct*/
Quantity* parseNumber(char* num);

/**sets values from a quantity to its units and value
 *@pre nothing can be null
 *@param quantity being info is stored in  :: intent in
 *@param units the units gotten from the quantity
 *@param value the value quantity value is being stored in.
 */
void setAttributeValue(Quantity* quantity,char* units,float* value);

/**creates a new group object must be freed when done with.
  *@return Group* a newly malloced group;
  */
Group* initGroup();

/**Recursivly goes into the group and grabs all the groups inside of them
 *@pre list and group must be malloced, valid and not free
 *@param list a group list in which groups will be added to
 *@param group struct*/
void getGroupsFromGroups(List* list, Group* group);


/*************SVG TESTING FUNCTIONS***********************************/
/**Tests if the svg image is valid.
 *@pre a malloced image
 *@param img malloced SVGimage
 *@return the img will return false if it fails
 */
bool testImg(SVGimage* img);

/**test if the given svg doc is valid.*/
bool IsValidSVG(xmlDoc* doc,char* schemaFile);

/**Checks if a list is valid by traversing through it and using the given checker function to test it
 *@pre list is a valid list
 *@param list the given list that will be checked
 *@checker will be used to test the given elements in the list ie for circles checkCircles should be passed
 *@return true if valid false if not valid
*/
bool isListValid(const List* list, bool (*checker)(const void*));

//checker functions for objects will be passed into isListValid function as checker
bool checkRects(const void*);
bool checkCircles(const void*);
bool checkPaths(const void*);
bool checkGroups(const void*);
bool checkAttribute(const void*);

/**checks if the current SVGimage structure is valid.
 *@param image the image that is being check must not be feed
 *@return returns if the image is valid or not
 */
bool checkSVGimage(SVGimage* image);
/*************SVG TESTING FUNCTIONS***********************************/


//pi const
#define PI 3.141592653598
#endif
