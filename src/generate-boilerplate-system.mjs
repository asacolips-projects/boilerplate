import inquirer from 'inquirer';
import replace from 'replace';
import { glob, globSync } from 'glob';
import fs from 'fs';
import path from 'path';

/**
 * System generator class.
 *
 * This class has several helper methods used to process files
 * for the `npm run generate` command. This is later called in
 * inquirer.promp().then() once user's terminal prompt answers
 * have been returned.
 */
class SystemGenerator {

  constructor(answers) {
    // Initialize our props.
    this.packageName = answers.packageName.trim();
    this.titleName = answers.titleName.trim();
    this.className = answers.className.trim();
    this.constantName = answers.constantName.trim();
    this.dataModel = answers.dataModel ?? false;
    // Transform answers.
    this.packageName = this.transformPackageName();
    this.className = this.transformClassName();
    this.constantName = this.transformConstantName();
    // If the package name had non-alphanumeric character, create a version
    // that can safely be used in object props.
    this.propName = this.packageName.replaceAll('-', '');
  }

  /**
   * Transform package name.
   *
   * @returns string
   *   Package name string, such as 'my-system'
   */
  transformPackageName() {
    const packageName = this.packageName ?? '';
    return packageName.toLowerCase().replaceAll(/[^a-z\d]/g, '-');
  }

  /**
   * Transform class name.
   *
   * @returns string
   *   Class name string, such as 'MySystem'
   */
  transformClassName() {
    const className = this.className ?? this.packageName;
    return className.replaceAll(/[^a-zA-Z\d]/g, '');
  }

  /**
   * Transform constant name.
   *
   * @returns string
   *   Constant name string, such as 'MY_SYSTEM'
   */
  transformConstantName() {
    const constantName = this.constantName ?? this.packageName;
    return constantName.toUpperCase().replaceAll(/[^A-Z\d]/g, '_');
  }

  /**
   * Clean build directory.
   *
   * Delete the build directory so that we have a fresh start.
   */
  cleanBuildDir() {
    fs.rmSync(`build`, {recursive: true, force: true});
  }

  /**
   * Copy files to build directory.
   *
   * @param {Array} files Array of file paths.
   */
  copyFiles(files) {
    files.forEach(source => {
      fs.cpSync(source, `build/${this.packageName}/${source}`, {recursive: true}, (err) => {
        if (err) throw err;
      });
    });

    // Handle data model conversion.
    if (this.dataModel) {
      const dataModelFiles = globSync('src/datamodels/*');
      dataModelFiles.forEach(source => {
        const dest = source.replaceAll('\\', '/').replace('src/datamodels/', '');
        fs.cpSync(source, `build/${this.packageName}/${dest}`, {recursive: true, force: true}, (err) => {
          if (err) throw err;
        });
      });
    }

    // Remove data model source.
    fs.rmSync(`build/${this.packageName}/src/datamodels`, {recursive: true, force: true});
  }

  /**
   * Replace file contents.
   *
   * Replace refercnes to 'boilerplate', 'Boilerplate', and 'BOILERPLATE'
   * in files copied over to the build directory.
   */
  replaceFileContents() {
    // Set patterns to iterate over later.
    const replacements = [
      {
        pattern: new RegExp(/game\.boilerplate/g),
        replacement: `game.${this.propName}`
      },
      {
        pattern: new RegExp(/flags\.boilerplate/g),
        replacement: `flags.${this.propName}`
      },
      {
        pattern: 'boilerplate',
        replacement: this.packageName
      },
      {
        pattern: 'Boilerplate',
        replacement: this.className
      },
      {
        pattern: 'BOILERPLATE',
        replacement: this.constantName
      }
    ];

    // Update title in system.json.
    replace({
      regex: 'Boilerplate',
      replacement: this.titleName,
      paths: [`./build/${this.packageName}/system.json`],
      silent: true
    });

    // Initialize our replacement options.
    const replaceOptions = {
      paths: [`./build/${this.packageName}/`],
      recursive: true,
      silent: true
    };

    // Update text based on the replacements array.
    replacements.forEach(replacePair => {
      replace({
        regex: replacePair.pattern,
        replacement: replacePair.replacement,
        ...replaceOptions
      })
    });
  }

  /**
   * Rename files.
   *
   * Rename files that had boilerplate in their name, such as
   * css/boilerplate.css.
   */
  renameFiles() {
    glob(`build/${this.packageName}/**/*boilerplate*.*`).then(files => {
      files.forEach(oldPath => {
        const file = path.basename(oldPath);
        const directory = path.dirname(oldPath);
        fs.rename(oldPath, `${directory}/${file.replaceAll('boilerplate', this.packageName)}`, (err) => {
          if (err) throw err;
        });
      })
    })
  }

  /**
   * Clean up package.json and build scripts.
   *
   * Removes this script and package-lock.json from the build directory.
   * Removes scripts and devDependencies related to this script from
   * package.json.
   *
   */
  cleanPackageJson() {
    // Remove unneeded files.
    fs.rmSync(`build/${this.packageName}/src/generate-boilerplate-system.mjs`);
    fs.rmSync(`build/${this.packageName}/package-lock.json`);

    // Load package.json so that we can remove dev dependencies.
    const pkgSrc = fs.readFileSync(`build/${this.packageName}/package.json`, "utf8");
    const pkgJson = JSON.parse(pkgSrc);
    // Delete the dependencies used by this script.
    delete pkgJson.scripts.generate;
    delete pkgJson.devDependencies.glob;
    delete pkgJson.devDependencies.prompt;
    delete pkgJson.devDependencies.renamer;
    delete pkgJson.devDependencies.replace;
    delete pkgJson.devDependencies.inquirer;
    // Write the new package.json
    fs.writeFileSync(`build/${this.packageName}/package.json`, JSON.stringify(pkgJson, null, '  '), 'utf8');
  }
}

/**
 * Execute inquirer prompt for user input.
 */
inquirer
  // Initialize prompts.
  .prompt([
    {
      type: 'input',
      name: 'packageName',
      message: 'Enter the package name of your system, such as "my-system" (alphanumeric characters and hyphens only):',
      default: 'my-system'
    },
    {
      type: 'input',
      name: 'titleName',
      message: 'Enter the formatted name of your system, such as "My System":',
      default: 'My System'
    },
    {
      type: 'input',
      name: 'className',
      message: 'Enter the name of your system for usage in JS classes, such as "MySystem" (alphanumeric characters only):',
      default: 'MySystem'
    },
    {
      type: 'input',
      name: 'constantName',
      message: 'Enter the name of your system for usage in constants, such as "MY_SYSTEM" (alphanumeric characters and underscores only):',
      default: 'MY_SYSTEM'
    },
    {
      type: 'confirm',
      name: 'dataModel',
      message: 'Use DataModel instead of template.json?',
      default: false
    }
  ])
  // Handle answers.
  .then((answers) => {
    // Validate for empty values.
    for (let [question, answer] of Object.entries(answers)) {
      if (question === 'dataModel') continue;
      if (!answer || !answer.length || answer.trim().length < 1) {
        throw new Error(`${question} cannot be empty.`);
      }
    }

    // Initialize our generator class.
    const generator = new SystemGenerator(answers);

    // Clean out our build directory.
    generator.cleanBuildDir();

    // Glob Boilerplate's files so that we can process them.
    glob('*', {ignore: ['node_modules/**'] }).then(files => {
      // Copy all files into the build dir.
      generator.copyFiles(files);
      // Replace boilerplate name mentions in files.
      generator.replaceFileContents();
      // Rename files that had boilerplate in their name.
      generator.renameFiles();
      // Remove generator files and update package.json.
      generator.cleanPackageJson();
    });

    // Output a success message.
    console.log(`Success! Your system has been written to the ${generator.packageName}/ directory.`);
  })
  // Handle errors.
  .catch((error) => {
    console.error(error);
  });