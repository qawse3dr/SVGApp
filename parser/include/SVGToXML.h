
#ifndef SVG_TO_XML_H
#define SVG_TO_XML_H

/**Takes in a svg image and converts it to a xmlTree
    @pre img is malloced and not null
    @param img the image should be valid and not freed
    @return a tree reperenstation of the image
    */
xmlDoc* SVGimageToTree(SVGimage* img);

/**sets the other attributes to a given node
 *@pre nothing is null or freed
 *@node the node the other attirbutes are being added too.
  *@attributes the otherattributes list that are getting added to the node.
*/
void setSVGTreeAttributes(xmlNode* node,List* list);

/**takes in the root node and sets the nameSpace.
 *@pre nothing is null or freed
 *@root the node ns will be added to
 *@img the image that the namespace is in*/
void setSVGTreeNS(xmlNode* root, SVGimage* img);

/**adds the list to a node based on a function pointer
 *@pre nothing is null or freed a valid adder function
 *@param node the parent the node info is being added to
 *@param list the list that is being added to the node children
 *@param adder the function that will add the list to the node
*/
void addListToNode(xmlNode* node, List* list, void (*adder)(xmlNode* node,void* element));

/**creates a tag of name name and sets the text content to node
 *@pre nothing is freed or null
 *@param node the node that will be the parent to the text
 *@param name the name of the text node
 *@param text the text to be added the the node*/
void textToXmlNode(xmlNode* node, const char* name, const char* text);


/**Helper function  to convert elements to nodes*/

void rectToNode(xmlNode* node,void* element);
void circleToNode(xmlNode* node,void* element);
void pathsToNode(xmlNode* node,void* element);
void groupsToNode(xmlNode* node,void* element);






#endif
