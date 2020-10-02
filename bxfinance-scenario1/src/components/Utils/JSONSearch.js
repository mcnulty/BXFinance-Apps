/* 
PING INTEGRATION
A recursive JSON search algorithm.
Originally written by shakhal in classic JS.
Refactored to ES6 by...

@author dr-mohamed-benkhalifa
@see https://gist.github.com/shakhal/3cf5402fc61484d58c8d
*/

export default class JSONSearch {

    /* 
    Find values by key in a JSON object
    @param obj the JSON object to be searched recursively
    @param key the key for which to search
    @return array of results
    */
    findValues(obj, key) {
        console.info("JSONSearch.js", "Recursively searching your object for " + key);

        let list = [];
        if (!obj) return list;
        if (obj instanceof Array) {
            for (var i in obj) {
                list = list.concat(this.findValues(obj[i], key));
            }
            return list;
        }
        if (obj[key]) list.push(obj[key]);

        if ((typeof obj == "object") && (obj !== null)) {
            let children = Object.keys(obj);
            if (children.length > 0) {
                for (let i = 0; i < children.length; i++) {
                    list = list.concat(this.findValues(obj[children[i]], key));
                }
            }
        }
        return list;
    }
}
