import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import FormGroup from '@bootstrap-styled/v4/lib/Form/FormGroup';
import FormFeedback from '@bootstrap-styled/v4/lib/Form/FormFeedback';
import Badge from '@bootstrap-styled/v4/lib/Badge';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import { addField, translate, FieldTitle } from 'ra-core';
import Option from '@bootstrap-styled/v4/lib/Option';

import SelectMutiple from '../extendMui/SelectMutiple';

const sanitizeRestProps = ({
  addLabel,
  allowEmpty,
  basePath,
  choices,
  className,
  component,
  crudGetMatching,
  crudGetOne,
  defaultValue,
  filter,
  filterToQuery,
  formClassName,
  initializeForm,
  input,
  isRequired,
  label,
  limitChoicesToValue,
  locale,
  meta,
  onChange,
  options,
  optionValue,
  optionText,
  perPage,
  record,
  reference,
  resource,
  setFilter,
  setPagination,
  setSort,
  sort,
  source,
  textAlign,
  translate,
  translateChoice,
  validation,
  ...rest
}) => rest;

const styles = theme => ({
  root: {},
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  select: {
    height: 'auto',
    overflow: 'auto',
  },
});

/**
 * An Input component for a select box allowing multiple selections, using an array of objects for the options
 *
 * Pass possible options as an array of objects in the 'choices' attribute.
 *
 * By default, the options are built from:
 *  - the 'id' property as the option value,
 *  - the 'name' property an the option text
 * @example
 * const choices = [
 *    { id: 'programming', name: 'Programming' },
 *    { id: 'lifestyle', name: 'Lifestyle' },
 *    { id: 'photography', name: 'Photography' },
 * ];
 * <SelectArrayInput source="tags" choices={choices} />
 *
 * You can also customize the properties to use for the option name and value,
 * thanks to the 'optionText' and 'optionValue' attributes.
 * @example
 * const choices = [
 *    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
 *    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
 * ];
 * <SelectArrayInput source="authors" choices={choices} optionText="full_name" optionValue="_id" />
 *
 * `optionText` also accepts a function, so you can shape the option text at will:
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
 * <SelectArrayInput source="authors" choices={choices} optionText={optionRenderer} />
 *
 * `optionText` also accepts a React Element, that will be cloned and receive
 * the related choice as the `record` prop. You can use Field components there.
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const FullNameField = ({ record }) => <span>{record.first_name} {record.last_name}</span>;
 * <SelectArrayInput source="authors" choices={choices} optionText={<FullNameField />}/>
 *
 * The choices are translated by default, so you can use translation identifiers as choices:
 * @example
 * const choices = [
 *    { id: 'programming', name: 'myroot.tags.programming' },
 *    { id: 'lifestyle', name: 'myroot.tags.lifestyle' },
 *    { id: 'photography', name: 'myroot.tags.photography' },
 * ];
 */
export class SelectArrayInput extends Component {
  /*
   * Using state to bypass a redux-form comparison but which prevents re-rendering
   * @see https://github.com/erikras/redux-form/issues/2456
   */
  state = {
    value: this.props.input.value || [],
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.input.value !== this.props.input.value) {
      this.setState({ value: nextProps.input.value || [] });
    }
  }

  handleChange = event => {
    this.props.input.onChange(event.target.value);
    // HACK: For some reason, redux-form does not consider this input touched without calling onBlur manually
    this.props.input.onBlur(event.target.value);
    this.setState({ value: event.target.value });
  };

  renderMenuItemOption = choice => {
    const { optionText, translate, translateChoice } = this.props;
    if (React.isValidElement(optionText)) {
      return React.cloneElement(optionText, {
        record: choice,
      });
    }
    const choiceName = typeof optionText === 'function'
      ? optionText(choice)
      : get(choice, optionText);
    return translateChoice
      ? translate(choiceName, { _: choiceName })
      : choiceName;
  };

  renderMenuItem = choice => {
    const { optionValue } = this.props;
    return (
      <Option
        key={get(choice, optionValue)}
        value={get(choice, optionValue)}
        type="button"
      >
        {this.renderMenuItemOption(choice)}
      </Option>
    );
  };

  render() {
    const {
      choices,
      classes,
      className,
      isRequired,
      label,
      meta,
      options,
      resource,
      source,
      optionText,
      optionValue,
      ...rest
    } = this.props;
    if (typeof meta === 'undefined') {
      throw new Error(
        "The SelectInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/react-admin/Inputs.html#writing-your-own-input-component for details."
      );
    }
    const { touched, error, helperText = false } = meta;

    return (
      <FormGroup
        className={className}
        {...sanitizeRestProps(rest)}
      >
        <FieldTitle
          label={label}
          source={source}
          resource={resource}
          isRequired={isRequired}
        />
        <SelectMutiple
          value={this.state.value}
          name={source}
          renderValue={selected => (
            <React.Fragment className={classes.chips}>
              {choices
                .filter(choice => selected.includes(get(choice, optionValue)))
                .map(choice => (
                  <Badge
                    key={get(choice, optionValue)}
                    className="p-2 mx-1"
                  >
                    {this.renderMenuItemOption(choice)}
                  </Badge>
                ))}
            </React.Fragment>
          )}
          {...options}
          onChange={this.handleChange}
        >
          {choices.map(this.renderMenuItem)}
        </SelectMutiple>
        {!!(touched && error) && <FormFeedback>{error}</FormFeedback>}
        {touched && error && <FormFeedback>{helperText}</FormFeedback>}
      </FormGroup>
    );
  }
}

SelectArrayInput.propTypes = {
  choices: PropTypes.arrayOf(PropTypes.object),
  classes: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,
  input: PropTypes.object,
  isRequired: PropTypes.bool,
  label: PropTypes.string,
  meta: PropTypes.object,
  options: PropTypes.object,
  optionText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element,
  ]).isRequired,
  optionValue: PropTypes.string.isRequired,
  resource: PropTypes.string,
  source: PropTypes.string,
  translate: PropTypes.func.isRequired,
  translateChoice: PropTypes.bool,
};

SelectArrayInput.defaultProps = {
  classes: {},
  choices: [],
  options: {},
  optionText: 'name',
  optionValue: 'id',
  translateChoice: true,
};

const EnhancedSelectArrayInput = compose(
  addField,
  translate,
  withStyles(styles)
)(SelectArrayInput);

export default EnhancedSelectArrayInput;