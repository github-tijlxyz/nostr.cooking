import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export function parseMarkdown(markdown: string) {
  const parsedMarkdown = md.render(markdown);

  return parsedMarkdown;
}

interface MarkdownInformation {
  prepTime: string;
  cookTime: string;
  servings: string;
}

interface MarkdownTemplate {
  chefNotes?: string;
  information?: MarkdownInformation;
  ingredients: string[];
  directions: string[];
  additionalMarkdown?: string;
}

export function validateMarkdownTemplate(markdown: string): MarkdownTemplate | string {
  const template: MarkdownTemplate = {
    ingredients: [],
    directions: []
  };

  template.information = {
    prepTime: '',
    cookTime: '',
    servings: ''
  };

  const sections = markdown.match(/## [A-Za-z\s']+\n[^#]+/g);

  if (!sections) {
    return 'Sections are missing.';
  }

  for (const section of sections) {
    if (section.startsWith("## Chef's notes")) {
      const chefNotes = section.split("## Chef's notes")[1].trim();
      if (chefNotes.length > 99999) {
        return "Chef's notes exceed character limit.";
      }
      template.chefNotes = chefNotes;
    } else if (section.startsWith('## Details')) {
      const detailsLines = section.split('\n').slice(1, -1);
      for (const line of detailsLines) {
        const [key, value] = line.split(': ');
        if (key === '- ⏲️ Prep time') {
          if (value.length > 999) {
            return 'Prep time exceeds character limit.';
          }
          template.information.prepTime = value;
        } else if (key === '- 🍳 Cook time') {
          if (value.length > 999) {
            return 'Cook time exceeds character limit.';
          }
          template.information.cookTime = value;
        } else if (key === '- 🍽️ Servings') {
          if (value.length > 999) {
            return 'Servings exceed character limit.';
          }
          template.information.servings = value;
        }
      }
    } else if (section.startsWith('## Ingredients')) {
      const ingredientsLines = section.split('\n').slice(1, -1);
      for (const line of ingredientsLines) {
        if (line.startsWith('- ')) {
          const ingredient = line.substring(2).trim();
          if (ingredient.length > 9999) {
            return 'An ingredient exceeds the character limit.';
          }
          template.ingredients.push(ingredient);
        }
      }
    } else if (section.startsWith('## Directions')) {
      const directionsLines = section.split('\n').slice(1);
      let prevStepNumber = 0;
      for (const line of directionsLines) {
        if (line.match(/^\d+\./)) {
          const stepNumber = parseInt(line.match(/^\d+/)[0], 10);
          if (stepNumber !== prevStepNumber + 1) {
            return 'Directions are not in the correct ordered list format.';
          }
          const stepDescription = line.split(/^\d+\./)[1].trim();
          if (stepDescription.length > 9999) {
            return 'A step in the directions exceeds the character limit.';
          }
          template.directions.push(stepDescription);
          prevStepNumber = stepNumber;
        } else if (line.trim() !== '') {
          return 'Directions are not in the correct ordered list format.';
        }
      }
    } else if (section.startsWith('## Additional Resources')) {
      const additionalMarkdown = section.split('## Additional Resources')[1].trim();
      template.additionalMarkdown = additionalMarkdown;
    }
  }

  if (template.directions.length < 1 || template.ingredients.length < 1) {
    return 'Directions and/or ingredients list too short.';
  }

  return template;
}

export function createMarkdown(
  chefsnotes: string,
  preptime: string,
  cooktime: string,
  servings: string,
  ingredients: string,
  directions: string,
  additionalMarkdown: string
) {
  let template: string = ``;

  if (chefsnotes !== '') {
    template += `
## Chef's notes

${chefsnotes}
`;
  }

  if (preptime !== '' || cooktime !== '' || servings !== '') {
    template += `
## Details

`;
    if (preptime !== '') {
      template += `- ⏲️ Prep time: ${preptime}
`;
    }

    if (cooktime !== '') {
      template += `- 🍳 Cook time: ${cooktime}
`;
    }

    if (servings !== '') {
      template += `- 🍽️ Servings: ${servings}
`;
    }
  }

  if (ingredients.length > 1) {
    template += `
## Ingredients

`;
    template += ingredients;
  }

  if (directions.length > 1) {
    template += `

## Directions

`;
    template += directions;
  }

  if (additionalMarkdown !== '') {
    template += `

## Additional Resources

${additionalMarkdown}

`;
  }

  return template;
}
