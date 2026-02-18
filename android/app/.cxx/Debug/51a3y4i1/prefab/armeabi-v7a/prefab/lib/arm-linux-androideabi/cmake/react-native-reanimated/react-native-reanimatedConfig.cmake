if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "D:/Vs Code Projects/Navigation/node_modules/react-native-reanimated/android/build/intermediates/cxx/Debug/c5m5s3u1/obj/armeabi-v7a/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "D:/Vs Code Projects/Navigation/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

