const { exec } = require("child_process");
const icons = require("./icon-config.json");
const glob = require("glob");
const fs = require("fs");

const defaultConfig = {
  iconColor: "#000",
  borderSize: 1,
  borderColor: "#000",
  backgroundColor: "#fff",
  padding: 2,
};

// make sure temp and out dirs exist
fs.mkdirSync(`./dist/`, { recursive: true });
fs.mkdirSync(`./tmp/`, { recursive: true });

glob("./icons/*/*.svg", (err, files) => {
  const configIcons = Object.keys(icons);
  const allIconIds = files.map((file) =>
    file.replace("./icons/", "").replace(".svg", "")
  );

  for (iconId of allIconIds) {
    const iconConfig = configIcons.includes(iconId)
      ? icons[iconId]
      : defaultConfig;

    const iconData = fs.readFileSync(`./icons/${iconId}.svg`, {
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
          r="${7.5 + iconConfig.padding}"
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
      .replace(`width="15`, `width="${newWidth}`)
      .replace(`height="15`, `height="${newWidth}`);

    fs.writeFileSync(`./tmp/${iconId.split("/")[1]}.svg`, newIconData, "utf8");
  }

  // pack it up with spritezero and delete temp files
  exec("spritezero dist/sr-sprite ./tmp/ && rm -rf ./tmp");
});
