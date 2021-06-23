const { exec } = require("child_process");
const icons = require("./icon-config.json");
const glob = require("glob");
const fs = require("fs");

const defaultConfig = {
  iconColor: "#fff",
  borderSize: 1,
  borderColor: "#fff",
  backgroundColor: "#000",
  padding: 5,
};

// make sure temp and out dirs exist
if (!fs.existsSync(`./dist/`)) fs.mkdirSync(`./dist/`, { recursive: true });
if (!fs.existsSync(`./tmp/`)) fs.mkdirSync(`./tmp/`, { recursive: true });

glob("./icons/*/*.svg", (err, files) => {
  const configIcons = Object.keys(icons);
  const allIconIds = files.map((file) =>
    file.replace("./icons/", "").replace(".svg", "")
  );

  // icons in custom/ folder just get copied without backgrounds/etc
  const customIconIds = allIconIds.filter((iconId) =>
    iconId.includes("custom/")
  );

  // all other folders get processed
  for (iconId of customIconIds) {
    fs.copyFileSync(
      `./icons/${iconId}.svg`,
      `./tmp/${iconId.split("/")[1]}.svg`
    );
  }

  const editIconIds = allIconIds.filter(
    (iconId) => !iconId.includes("custom/")
  );

  for (iconId of editIconIds) {
    const iconConfig = configIcons.includes(iconId)
      ? Object.assign({}, defaultConfig, icons[iconId])
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
  exec(
    "spritezero dist/sr-sprite ./tmp/ && spritezero --retina dist/sr-sprite@2x ./tmp && rm -rf ./tmp"
  );
});
