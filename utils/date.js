module.exports.formatDate = (time) => {
    return "<t:" + Math.round(time / 1000) + ":f> (" + "<t:" + Math.round(time / 1000) + ":R>)";
}