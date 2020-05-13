
#ifndef SVG_EDITOR_H
#define SVG_EDITOR_H

typedef struct JsonAttrStruct {
  char* name;
  char* value;
  struct JsonAttrStruct* next;
}JsonAttr;

//helper functions for adding components to the svgImage
/**
 *@pre must take in a valid svgImage and a valid attribute
 *@param SVGimage a malloced an not freed SVGimage.
              the image the new obj will be added too
  *@param obj the object to be added. if wrong object is entered it will fail and crash
  */
void addCircle(SVGimage*image ,void* obj);
void addRect(SVGimage* image,void* obj);
void addPath(SVGimage* image,void* obj);


//helper functions for adding attribute to a component

void addAttrSVGimage(SVGimage* image, int elemIndex, Attribute* attr);
void addAttrCircle(SVGimage* image, int elemIndex, Attribute* attr);
void addAttrRect(SVGimage* image, int elemIndex, Attribute* attr);
void addAttrPath(SVGimage* image, int elemIndex, Attribute* attr);
void addAttrGroup(SVGimage* image, int elemIndex, Attribute* attr);

/**checks if an element exists in the other lists or else it will add it
 *@param list the otherAttribute list being added to
 *@param attr the attribute that is being added
 */
void addOtherAttr(List* list,Attribute* attr);
//gets a value at given index. used for adding attributes to a component
void* getComponentFromList(List* list, int index);

/**parses a jSON string and returns the value as a linked list
 *@JsonString a string that represents a JSON
 *@return a struct holding the values of the Json
*/
JsonAttr* parseJSONString(const char* JsonString);

/*helper functions to get the attributes of an object.
 *returns a JSON in this format
    JSON {attr:["need attrs"],otherAttr:["extra atter"]}
*/
char* getAttrSVGimage(SVGimage* img, int index);
char* getAttrCircle(SVGimage* img, int index);
char* getAttrRect(SVGimage* img, int index);
char* getAttrPath(SVGimage* img, int index);
char* getAttrGroup(SVGimage* img, int index);
#endif
