#include "SVGParser.h"
#include <assert.h>

//Test harness
int main(){

    char* str = getValidSVGimage("../uploads/quad01_A2.svg");
    printf("str %s\n",str);
    free(str);

    addComponentToFile("../uploads/quad01_A2.svg",0,"{\"cx\":5,\"cy\":5,\"r\":1,\"units\":\"cm\"}");

    str = getComponents("../uploads/quad01_A2.svg");
    printf("str %s\n",str);

    setAttributeToFile("../uploads/quad01_A2.svg",2,0,"fill","#");
    free(str);
    return 0;
}
