import {
  isEmail,
  isEmpty,
  isMaxLength,
  isMaxNumber,
  isMinLength,
  isMinNumber,
  isNumber,
  isPassword,
  isStrongPassword,
} from './validationUtils';
import {
  EventListenerInterface,
  FieldConfigInterface,
  FieldRuleInterface,
  GlobalConfigInterface,
  GroupFieldInterface,
  GroupFieldsInterface,
  GroupFieldType,
  GroupRuleInterface,
  GroupRules,
  Rules,
  FieldInterface,
  FieldsInterface,
} from './interfaces';
import { getDefaultFieldMessage, getDefaultGroupMessage } from './messages';

const defaultGlobalConfig: GlobalConfigInterface = {
  errorFieldStyle: {
    color: '#b81111',
    border: '1px solid #B81111',
  },
  errorFieldCssClass: 'js-validate-error-field',
  errorLabelStyle: {
    color: '#b81111',
  },
  errorLabelCssClass: 'js-validate-error-label',
};

class JustValidate {
  $form: Element | null = null;
  fields: FieldsInterface = {};
  groupFields: GroupFieldsInterface = {};
  errors: {
    [key: string]: {
      message?: string;
    };
  } = {};
  isValid = false;
  isSubmitted = false;
  globalConfig: GlobalConfigInterface;
  $errorLabels: HTMLDivElement[] = [];
  eventListeners: EventListenerInterface[] = [];

  constructor(
    form: string | Element,
    globalConfig?: Partial<GlobalConfigInterface>
  ) {
    if (typeof form === 'string') {
      const elem = document.querySelector(form);

      if (!elem) {
        throw Error(
          `Form with ${form} selector not found! Please check the form selector`
        );
      }
      this.setForm(elem);
    } else if (form instanceof Element) {
      this.setForm(form);
    } else {
      throw Error(
        `Form selector is not valid. Please specify a string selector or a DOM element.`
      );
    }

    this.globalConfig = { ...defaultGlobalConfig, ...globalConfig };
  }

  getFieldErrorMessage(fieldRule: FieldRuleInterface) {
    return (
      fieldRule.errorMessage ||
      getDefaultFieldMessage(fieldRule.rule, fieldRule.value)
    );
  }

  getGroupErrorMessage(groupRule: GroupRuleInterface) {
    return groupRule.errorMessage || getDefaultGroupMessage(groupRule.rule);
  }

  setFieldInvalid(field: string, fieldRule: FieldRuleInterface) {
    this.fields[field].isValid = false;
    this.fields[field].errorMessage = this.getFieldErrorMessage(fieldRule);
  }

  setFieldValid(field: string) {
    this.fields[field].isValid = true;
  }

  setGroupInvalid(groupName: string, groupRule: GroupRuleInterface) {
    this.groupFields[groupName].isValid = false;
    this.groupFields[groupName].errorMessage = this.getGroupErrorMessage(
      groupRule
    );
  }

  setGroupValid(groupName: string) {
    this.groupFields[groupName].isValid = true;
  }

  getElemValue(elem: HTMLInputElement): boolean | string {
    switch (elem.type) {
      case 'checkbox':
        return elem.checked;
      default:
        return elem.value;
    }
  }

  validateGroupRule(
    groupName: string,
    type: GroupFieldType,
    elems: HTMLInputElement[],
    groupRule: GroupRuleInterface
  ) {
    switch (groupRule.rule) {
      case GroupRules.Required: {
        if (type === 'radio' || type === 'checkbox') {
          if (elems.every((elem) => !elem.checked)) {
            this.setGroupInvalid(groupName, groupRule);
          } else {
            this.setGroupValid(groupName);
          }
        }
      }
    }
  }

  validateFieldRule(
    field: string,
    elem: HTMLInputElement,
    fieldRule: FieldRuleInterface
  ) {
    const ruleValue = fieldRule.value;
    const elemValue = this.getElemValue(elem);

    switch (fieldRule.rule) {
      case Rules.Required: {
        if (isEmpty(elemValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.Email: {
        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        if (!isEmail(elemValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.MaxLength: {
        if (!ruleValue) {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] field is not defined. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof ruleValue !== 'number') {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] should be a number. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        if (isMaxLength(elemValue, ruleValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.MinLength: {
        if (!ruleValue) {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] field is not defined. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof ruleValue !== 'number') {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] should be a number. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        if (isMinLength(elemValue, ruleValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.Password: {
        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        if (!isPassword(elemValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.StrongPassword: {
        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        if (!isStrongPassword(elemValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.Number: {
        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        if (!isNumber(elemValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.MaxNumber: {
        if (!ruleValue) {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] field is not defined. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof ruleValue !== 'number') {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] field should be a number. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        const num = +elemValue;

        if (Number.isNaN(num) || isMaxNumber(num, ruleValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.MinNumber: {
        if (!ruleValue) {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] field is not defined. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof ruleValue !== 'number') {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] field should be a number. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        const num = +elemValue;

        if (Number.isNaN(num) || isMinNumber(num, ruleValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }
        break;
      }

      case Rules.CustomRegexp: {
        if (!ruleValue) {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] field is not defined. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof ruleValue !== 'string') {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] field should be a string. Validation will be skipped for this rule.`
          );
          return;
        }

        let regexp;

        try {
          regexp = new RegExp(ruleValue);
        } catch (e) {
          console.error(
            `Value for ${fieldRule.rule} rule for [${field}] should be a valid regexp. Validation will be skipped for this rule.`
          );
          break;
        }

        if (typeof elemValue !== 'string') {
          this.setFieldInvalid(field, fieldRule);
          break;
        }

        if (!regexp.test(elemValue)) {
          this.setFieldInvalid(field, fieldRule);
        } else {
          this.setFieldValid(field);
        }

        break;
      }

      default: {
        if (!fieldRule.validator) {
          console.error(
            `Validator for custom rule for [${field}] field is not defined. Validation will be skipped for this rule.`
          );
          return;
        }

        if (typeof fieldRule.validator !== 'function') {
          console.error(
            `Validator for custom rule for [${field}] field should be a function. Validation will be skipped for this rule.`
          );
          return;
        }

        const result = fieldRule.validator(elemValue, this.fields);

        if (typeof result !== 'boolean') {
          console.error(
            `Validator return value for [${field}] field should be boolean. It will be cast to boolean.`
          );
        }

        if (!result) {
          this.setFieldInvalid(field, fieldRule);
          break;
        } else {
          this.setFieldValid(field);
        }
      }
    }
  }

  validateField(fieldName: string, field: FieldInterface) {
    field.rules.forEach((rule) => {
      this.validateFieldRule(fieldName, field.elem, rule);
    });
  }

  validateGroup(groupName: string, group: GroupFieldInterface) {
    group.rules.forEach((rule) => {
      this.validateGroupRule(groupName, group.type, group.elems, rule);
    });
  }

  validate() {
    Object.keys(this.fields).forEach((fieldName) => {
      const field = this.fields[fieldName];
      this.validateField(fieldName, field);
    });

    Object.keys(this.groupFields).forEach((groupName) => {
      const group = this.groupFields[groupName];
      this.validateGroup(groupName, group);
    });

    this.renderErrors();
  }

  setForm(form: Element) {
    this.$form = form;
    this.$form.setAttribute('novalidate', 'novalidate');
    this.$form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      this.isSubmitted = true;
      this.validate();
    });
  }

  handleFieldChange = (target: HTMLInputElement) => {
    let currentField;
    let currentFieldName;

    for (const fieldName in this.fields) {
      const field = this.fields[fieldName];

      if (field.elem === target) {
        currentField = field;
        currentFieldName = fieldName;
        break;
      }
    }

    if (!currentField || !currentFieldName) {
      return;
    }

    this.validateField(currentFieldName, currentField);
  };

  handleGroupChange = (target: HTMLInputElement) => {
    let currentGroup;
    let currentGroupName;

    for (const groupName in this.groupFields) {
      const group = this.groupFields[groupName];

      if (group.elems.find((elem) => elem === target)) {
        currentGroup = group;
        currentGroupName = groupName;
        break;
      }
    }

    if (!currentGroup || !currentGroupName) {
      return;
    }

    this.validateGroup(currentGroupName, currentGroup);
  };

  handlerChange = (ev: Event) => {
    if (!ev.target) {
      return;
    }

    this.handleFieldChange(ev.target as HTMLInputElement);
    this.handleGroupChange(ev.target as HTMLInputElement);

    this.renderErrors();
  };

  addListener(type: string, elem: HTMLInputElement) {
    elem.addEventListener(type, this.handlerChange);
    this.eventListeners.push({ type, elem, func: this.handlerChange });
  }

  addField(
    field: string,
    rules: FieldRuleInterface[],
    config?: FieldConfigInterface
  ): JustValidate {
    if (typeof field !== 'string') {
      throw Error(
        `Field selector is not valid. Please specify a string selector.`
      );
    }

    const elem = document.querySelector(field) as HTMLInputElement;

    if (!elem) {
      throw Error(
        `Field with ${field} selector not found! Please check the field selector.`
      );
    }

    if (!Array.isArray(rules) || !rules.length) {
      throw Error(
        `Rules argument for the field [${field}] should be an array and should contain at least 1 element.`
      );
    }

    rules.forEach((item) => {
      if (!('rule' in item || 'validator' in item)) {
        throw Error(
          `Rules argument for the field [${field}] must contain at least one rule or validator property.`
        );
      }
    });

    this.fields[field] = {
      elem,
      rules,
      value: '',
      isDirty: false,
      isValid: undefined,
      config,
    };

    this.setListeners(elem);
    return this;
  }

  addRequiredGroup(
    groupField: string,
    errorMessage?: string,
    config?: FieldConfigInterface
  ): JustValidate {
    if (typeof groupField !== 'string') {
      throw Error(
        `Group selector is not valid. Please specify a string selector.`
      );
    }

    const elem = document.querySelector(groupField) as HTMLElement;

    if (!elem) {
      throw Error(
        `Group with ${groupField} selector not found! Please check the group selector.`
      );
    }

    const $inputs: NodeListOf<HTMLInputElement> = elem.querySelectorAll(
      'input'
    );

    const isRadio = Array.from($inputs).every(
      ($input) => $input.type === 'radio'
    );

    const isCheckbox = Array.from($inputs).every(
      ($input) => $input.type === 'checkbox'
    );

    if (!isRadio && !isCheckbox) {
      throw Error(`Group should contain either or checkboxes or radio buttons`);
    }

    this.groupFields[groupField] = {
      rules: [
        {
          rule: GroupRules.Required,
          errorMessage,
        },
      ],
      groupElem: elem,
      elems: Array.from($inputs),
      type: isRadio ? 'radio' : 'checkbox',
      isDirty: false,
      isValid: undefined,
      config,
    };

    $inputs.forEach((input) => {
      this.setListeners(input);
    });

    return this;
  }

  setListeners(elem: HTMLInputElement) {
    switch (elem.type) {
      case 'checkbox': {
        this.addListener('change', elem);
        break;
      }

      case 'radio': {
        this.addListener('change', elem);
        break;
      }

      default: {
        this.addListener('keyup', elem);
      }
    }
  }

  removeField(field: string): JustValidate {
    if (typeof field !== 'string') {
      throw Error(
        `Field selector is not valid. Please specify a string selector.`
      );
    }

    if (!(field in this.fields)) {
      console.warn(`There is no [${field}] field.`);
      return this;
    }

    delete this.fields[field];
    return this;
  }

  clearErrors() {
    this.$errorLabels.forEach((item) => item.remove());

    for (const fieldName in this.fields) {
      const field = this.fields[fieldName];

      if (!field.isValid) {
        continue;
      }

      const style =
        field.config?.errorFieldStyle || this.globalConfig.errorFieldStyle;

      Object.keys(style).forEach((key) => {
        field.elem.style[key] = '';
      });
    }

    for (const groupName in this.groupFields) {
      const group = this.groupFields[groupName];

      if (!group.isValid) {
        continue;
      }

      const style =
        group.config?.errorFieldStyle || this.globalConfig.errorFieldStyle;

      Object.keys(style).forEach((key) => {
        group.elems.forEach((elem) => {
          elem.style[key] = '';
        });
      });
    }
  }

  lockForm() {
    const $elems: NodeListOf<HTMLInputElement> = this.$form!.querySelectorAll(
      'input, textarea, button, select'
    );
    for (let i = 0, len = $elems.length; i < len; ++i) {
      $elems[i].setAttribute('disabled', 'disabled');
      $elems[i].style.pointerEvents = 'none';
      $elems[i].style.webkitFilter = 'grayscale(100%)';
      $elems[i].style.filter = 'grayscale(100%)';
    }
  }

  unlockForm() {
    const $elems: NodeListOf<HTMLInputElement> = this.$form!.querySelectorAll(
      'input, textarea, button, select'
    );
    for (let i = 0, len = $elems.length; i < len; ++i) {
      $elems[i].removeAttribute('disabled');
      $elems[i].style.pointerEvents = '';
      $elems[i].style.webkitFilter = '';
      $elems[i].style.filter = '';
    }
  }

  renderErrors() {
    if (!this.isSubmitted) {
      return;
    }
    this.clearErrors();
    this.unlockForm();

    this.isValid = false;
    // if (Object.keys(this.errors).length === 0) {
    //   this.isValid = true;
    //   return;
    // }

    for (const fieldName in this.fields) {
      const field = this.fields[fieldName];

      if (field.isValid) {
        continue;
      }

      Object.assign(
        field.elem.style,
        field.config?.errorFieldStyle || this.globalConfig.errorFieldStyle
      );

      field.elem.classList.add(
        field.config?.errorFieldCssClass || this.globalConfig.errorFieldCssClass
      );

      const $errorLabel = document.createElement('div');
      $errorLabel.innerHTML = field.errorMessage!;

      Object.assign(
        $errorLabel.style,
        field.config?.errorLabelStyle || this.globalConfig.errorLabelStyle
      );

      $errorLabel.classList.add(
        field.config?.errorLabelCssClass || this.globalConfig.errorLabelCssClass
      );

      this.$errorLabels.push($errorLabel);

      if (field.elem.type === 'checkbox' || field.elem.type === 'radio') {
        const $label = document.querySelector(
          `label[for="${field.elem.getAttribute('id')}"]`
        );

        if (field.elem.parentElement?.tagName?.toLowerCase() === 'label') {
          field.elem.parentElement?.parentElement?.insertBefore(
            $errorLabel,
            null
          );
        } else if ($label) {
          $label.parentElement?.insertBefore($errorLabel, $label.nextSibling);
        } else {
          field.elem.parentElement?.insertBefore(
            $errorLabel,
            field.elem.nextSibling
          );
        }
      } else {
        field.elem.parentElement?.insertBefore(
          $errorLabel,
          field.elem.nextSibling
        );
      }
    }

    for (const groupName in this.groupFields) {
      const group = this.groupFields[groupName];

      if (group.isValid) {
        continue;
      }

      group.elems.forEach((elem) => {
        Object.assign(
          elem.style,
          group.config?.errorFieldStyle || this.globalConfig.errorFieldStyle
        );
        elem.classList.add(
          group.config?.errorFieldCssClass ||
            this.globalConfig.errorFieldCssClass
        );
      });

      const $errorLabel = document.createElement('div');
      $errorLabel.innerHTML = group.errorMessage!;

      Object.assign(
        $errorLabel.style,
        group.config?.errorLabelStyle || this.globalConfig.errorLabelStyle
      );

      $errorLabel.classList.add(
        group.config?.errorLabelCssClass || this.globalConfig.errorLabelCssClass
      );

      this.$errorLabels.push($errorLabel);

      group.groupElem.parentElement?.insertBefore(
        $errorLabel,
        group.groupElem.nextSibling
      );
    }

    // if (!this.tooltipSelectorWrap.length) {
    //   return;
    // }
    //
    // this.state.tooltipsTimer = setTimeout(() => {
    //   this.hideTooltips();
    // }, this.tooltipFadeOutTime);
  }

  destroy() {
    this.eventListeners.forEach((event) => {
      event.elem.removeEventListener(event.type, event.func);
    });
  }
}

export default JustValidate;
