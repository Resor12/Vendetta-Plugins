import { before } from "@revenge/patcher";
import Settings from "./Settings";
import { findByDisplayName } from "@revenge/metro";
import { ReactNative, stylesheet, constants as Constants } from "@revenge/metro/common";
import { semanticColors } from "@revenge/ui";
import { General } from "@revenge/ui/components";
import { SizeTag } from "./SizeTag";
import { findInReactTree } from "@revenge/utils";

const { View, Text } = General;
const { Pressable } = ReactNative;

let unpatch;

export default {
    onLoad: () => {
        const styles = stylesheet.createThemedStyleSheet({
            sizeTagWrapper: {
                position: 'relative'
            },
            sizeTag: {
                //backgroundColor: semanticColors.BACKGROUND_ACCENT,
                backgroundColor: '#1e1f2280',
                borderRadius: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                position: 'absolute',
                top: 6,
                left: 6
            },
            sizeText: {
                includeFontPadding: false,
                fontSize: 12,
                //color: semanticColors.TEXT_NORMAL,
                color: "white",
                fontFamily: Constants.Fonts.PRIMARY_BOLD,
            }
        });

        const Pressable = findByDisplayName("Pressable", false); // importowanie z ReactNative nie działa

        unpatch = before("render", Pressable.default.type, (args) => {
            if(!args) return;
            if(!args[0]) return;

            const [ props ] = args;

            if(!props) return;
            if(props.accessibilityRole != "imagebutton") return;
            
            if(!props.oldChildren){
                props.oldChildren = props.children;
            }
            if(!props.skip){
                if(!findInReactTree(props.oldChildren, m => m.props?.localImageSource)){
                    props.skip = true;
                }
            } else {
                return;
            }

            const fileUrl = props.oldChildren[0]?.props?.source?.uri;
            if(fileUrl){
                props.children = 
                <View style={styles.sizeTagWrapper}>
                    {props.oldChildren}
                    <View style={styles.sizeTag}>
                        <SizeTag url={fileUrl} style={styles.sizeText}/>
                    </View>
                </View>
            }
        });
    },
    onUnload: () => {
        unpatch?.();
    },
}
