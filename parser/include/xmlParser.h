/*
*Name: Lawrence Milne
*STD NUM: 1044930
*email: lmilne01
*/

/*
    This completle parse the xml image then pass it one to SVGPARSE

*/

#ifndef XMLPARSER_H
#define XMLPARSER_H
#include "SVGParser.h"

/*Takes in a blank image and files will with the info from doc and root.
@pre the image must already be malloced
@param image the image info will be added to
@param doc the xml doc info is pulled from
@param root the root of the xml tree
*/
void parseXML(SVGimage* image, xmlNode* root);





/**gets the textfrom the node.
 *@pre titleNode must contain the text content
 *@param title - the string that the info is being copied to
 *titleNode - the text node that holds the content
 */
void parseTitle(char* title,xmlNode* titleNode);



/**gets a rect from a rect node
 *@pre must be a rect node ie name == "rectangle"
 *@param rectNode the xml retangle
 *@return the retangle if it could be created if not returns null
 */
void parseRect(List* list, xmlNode* rectNode);

/**gets attribute of a type. only will get first one
 *@pre node must not be null
 *@param type the type of attribute trying to be retrived
 *@param node the node you are looking in
 *@return the retrived attribute null if not found
*/
Attribute* getAttributeFromNode(char* type, xmlNode* node);

/**Gets the namespace from an node
 *@pre namespace and node must exist
 *@param namespace the string it will be cpyed too
 *@param node the node that namespace will be accessed from
*/
void getNamespaceFromNode(char* namespace,xmlNode* node);

/**gets the other attritubes from the image
 *@pre node and list must exist also list must be an attriture lists
 *@param list attribute list
 *@param node the svg image node*/
void getImageAttributes(List* list,xmlNode* node);

/**parses a path tag from a path node
 *@pre must be a valid node and list
 *@param list list it will be added to must be a path list
 *@param node the node contaning the paths
 */
void parsePath(List* list, xmlNode* node);

/**parses a path tag from a circle node
 *@pre must be a valid node and list
 *@param list list it will be added to must be a circle list
 *@param node the node contaning the cirlce
 */
void parseCircle(List* list,xmlNode* node);

/**Parses a given functino from
 *@param text the text that its going to be added too
 * @the node that the info is being gotten from*/
void parseText(char* text,xmlNode* textNode);
/**gets group title and desc based on tag
 *@pre valid string and node
 *@param node tag
 *@param  group of tag
 */
void groupTag(xmlNode* node,Group* group);


#endif
