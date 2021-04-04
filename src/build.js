const icons = require("./icon-config.json");
const fs = require("fs");

for (const [iconPath, iconConfig] of Object.entries(icons)) {
  const iconData = fs.readFileSync(`./icons/${iconPath}.svg`, {
    encoding: "utf8",
  });

  const extraWidth = iconConfig.padding + iconConfig.borderSize;
  const newWidth = 15 + extraWidth * 2;
  const borderCircle = `
    <circle
      cy="7.5"
      cx="7.5"
      r="${7.5 + iconConfig.padding + iconConfig.borderSize}"
      fill="${iconConfig.borderColor}"
    />`;

  const backgroundCircle = `
    <circle
      cx="7.5"
      cy="7.5"
      r="${7.5 + iconConfig.borderSize}"
      fill="${iconConfig.backgroundColor}"
    />`;

  // insert circles before path
  const newIconData = iconData
    .replace(
      "<path",
      `${borderCircle}${backgroundCircle}<path fill="${iconConfig.iconColor}"`
    )
    .replace(
      `viewBox="0 0 15 15"`,
      `viewBox="-${extraWidth} -${extraWidth} ${newWidth} ${newWidth}"`
    )
    .replace(`width="15px"`, `width="${newWidth}px"`)
    .replace(`height="15px"`, `height="${newWidth}px"`);

  fs.mkdirSync(`./dist/${iconPath.split("/")[0]}`, { recursive: true });
  fs.writeFileSync(`./dist/${iconPath}.svg`, newIconData, "utf8");
}