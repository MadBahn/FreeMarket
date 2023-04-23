import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "@/store/reducer/common_reducer";

export default configureStore({
    reducer: {
        common: commonReducer
    }
});