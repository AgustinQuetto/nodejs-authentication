module.exports = (processValue, productionValue, developValue, localValue) => {
    if (processValue) return processValue;
    const value =
        process.env.NODE_ENV === `production`
            ? productionValue
            : process.env.NODE_ENV === `develop`
            ? developValue || productionValue
            : localValue || developValue || productionValue;
    if (typeof value === `undefined`) {
        console.log(`config value undefined`);
    }
    return value;
};
