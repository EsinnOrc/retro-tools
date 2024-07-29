import { useState, useCallback } from "react";

type UseBooleanReturn = {
    value: boolean;
    toggle: () => void;
    setFalse: () => void;
    setTrue: () => void;
};

const useBoolean = (defaultValue: boolean): UseBooleanReturn => {
    const [value, setValue] = useState(defaultValue);

    const toggle = useCallback(() => setValue((v) => !v), []);

    const setFalse = useCallback(() => setValue(false), []);

    const setTrue = useCallback(() => setValue(true), []);
    
    return { value, toggle, setFalse, setTrue };
};

export default useBoolean;