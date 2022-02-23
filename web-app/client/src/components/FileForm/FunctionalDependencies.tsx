import React, { useContext, useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { DefaultContext, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";

import Value from "../Value/Value";
import Toggle from "../Toggle/Toggle";
import Button from "../Button/Button";
import Slider from "../Slider/Slider";
import BuiltinDatasetSelector from "../BuiltinDatasetSelector/BuiltinDatasetSelector";
import FormItem from "../FormItem/FormItem";
import { AlgorithmConfigContext } from "../AlgorithmConfigContext";
import { builtinDataset, FDAlgorithm } from "../../types/types";
import { CREATE_FD_TASK } from "../../graphql/operations/mutations/createFDTask";
import { CHOOSE_FD_TASK } from "../../graphql/operations/mutations/chooseFDTask";
import { FDTaskProps, FileProps } from "../../../__generated__/globalTypes";
import { ErrorContext } from "../ErrorContext";

interface Props {
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
}

const FunctionalDependencies: React.FC<Props> = ({ setUploadProgress }) => {
  const { allowedValues, validators } = useContext(AlgorithmConfigContext)!;
  const { showError } = useContext(ErrorContext)!;
  const [file, setFile] = useState<File>();
  const [hasHeader, setHasHeader] = useState(true);
  const [separator, setSeparator] = useState<string>(",");
  const [algorithm, setAlgorithm] = useState<FDAlgorithm>();
  const [errorThreshold, setErrorThreshold] = useState("0.05");
  const [maxLHSAttributes, setMaxLHSAttributes] = useState("5");
  const [threadsCount, setThreadsCount] = useState("1");

  // Builtin kDatasets
  const [isWindowShown, setIsWindowShown] = useState(false);
  const [builtinDataset, setBuiltinDataset] = useState<builtinDataset>();

  useEffect(() => {
    setAlgorithm(
      allowedValues.allowedAlgorithms &&
        allowedValues.allowedAlgorithms.allowedFDAlgorithms[0]
    );
  }, [allowedValues]);

  const isValid = () =>
    (!!builtinDataset ||
      (validators.isFile(file) &&
        validators.isOfValidSize(file) &&
        validators.isOfValidFormat(file))) &&
    validators.isValidSeparator(separator) &&
    validators.isBetweenZeroAndOne(errorThreshold) &&
    validators.isInteger(maxLHSAttributes);

  const [
    createTask,
    {
      data: createTaskData,
      loading: createTaskLoading,
      error: createTaskError,
    },
  ] = useMutation(CREATE_TASK_WITH_UPLOADING_DATASET);
  const [
    chooseTask,
    {
      data: chooseTaskData,
      loading: chooseTaskLoading,
      error: chooseTaskError,
    },
  ] = useMutation(CREATE_TASK_WITH_CHOOSING_DATASET);
  const data =
    (createTaskData && createTaskData.createFDTask) ||
    (chooseTaskData && chooseTaskData.chooseFDTask);
  const loading = createTaskLoading || chooseTaskLoading;
  const error = createTaskError || chooseTaskError;

  const history = useHistory();
  useEffect(() => {
    if (error) {
      showError({ message: error.message });
    }
  }, [error]);
  useEffect(() => {
    if (data) {
      history.push(`/${data.state.taskID}`);
    }
  }, [data]);

  const submit = () => {
    if (isValid()) {
      const props: IntersectionTaskProps = {
        algorithmName: algorithm!.name,
        type: PrimitiveType.FD,
        errorThreshold: algorithm!.properties.hasErrorThreshold
          ? +errorThreshold
          : 0,
        maxLHS: algorithm!.properties.hasArityConstraint
          ? +maxLHSAttributes
          : -1,
        threadsCount: algorithm!.properties.isMultiThreaded ? +threadsCount : 1,
      };
      const datasetProps: FileProps = { delimiter: separator!, hasHeader };
      const context: DefaultContext = {
        fetchOptions: {
          useUpload: true,
          onProgress: (ev: ProgressEvent) => {
            setUploadProgress(ev.loaded / ev.total);
          },
        },
      };

      if (file) {
        createTask({
          variables: { props, datasetProps, table: file },
          context,
        });
      } else {
        chooseTask({
          variables: { props, fileID: builtinDataset!.ID },
          context,
        });
      }
    }
  };

  return (
    <>
      {isWindowShown && (
        <BuiltinDatasetSelector disable={() => setIsWindowShown(false)}>
          {allowedValues.allowedBuiltinDatasets &&
            allowedValues.allowedBuiltinDatasets.map((dataset) => (
              <Toggle
                toggleCondition={builtinDataset === dataset}
                onClick={() => {
                  setFile(undefined);
                  setBuiltinDataset(dataset);
                  setSeparator(dataset.delimiter);
                  setHasHeader(dataset.hasHeader);
                }}
                key={dataset.ID}
                className="mx-2"
              >
                {dataset.fileName}
              </Toggle>
            ))}
        </BuiltinDatasetSelector>
      )}
      <Row className="mx-2 mb-3">
        <FormItem>
          <h5 className="text-white mb-0 mx-2">File:</h5>
        </FormItem>
        <FormItem enabled={!builtinDataset}>
          <h5 className="text-white mb-0 mx-2">File properties:</h5>
          <Toggle
            onClick={() => setHasHeader(!hasHeader)}
            toggleCondition={hasHeader}
            className="mx-2"
          >
            Header
          </Toggle>
          <h5 className="text-white mb-0 mx-2">separator</h5>
          <Value
            value={separator || ""}
            onChange={setSeparator}
            size={2}
            inputValidator={validators.isValidSeparator}
            className="mx-2"
          />
        </FormItem>
        <FormItem>
          <h5 className="text-white mb-0 mx-2">Algorithm:</h5>
          <div className="d-flex flex-wrap align-items-center">
            {allowedValues.allowedAlgorithms &&
              allowedValues.allowedAlgorithms.allowedFDAlgorithms.map(
                (algo) => (
                  <Toggle
                    onClick={() => setAlgorithm(algo)}
                    toggleCondition={algorithm === algo}
                    key={algo.name}
                    className="mx-2"
                  >
                    {algo.name}
                  </Toggle>
                )
              )}
          </div>
        </FormItem>
        <FormItem enabled={algorithm?.properties.hasErrorThreshold}>
          <h5 className="text-white mb-0 mx-2">Error threshold:</h5>
          <Value
            value={errorThreshold}
            onChange={setErrorThreshold}
            size={8}
            inputValidator={validators.isBetweenZeroAndOne}
            className="mx-2"
          />
          <Slider
            value={errorThreshold}
            onChange={setErrorThreshold}
            step={1e-6}
            className="mx-2"
          />
        </FormItem>
        <FormItem enabled={algorithm?.properties.hasArityConstraint}>
          <h5 className="text-white mb-0 mx-2">Max LHS attributes:</h5>
          <Value
            value={maxLHSAttributes}
            onChange={setMaxLHSAttributes}
            size={3}
            inputValidator={validators.isInteger}
            className="mx-2"
          />
          <Slider
            value={maxLHSAttributes === "inf" ? "10" : maxLHSAttributes}
            min={1}
            max={10}
            onChange={setMaxLHSAttributes}
            step={1}
            className="mx-2"
          />
        </FormItem>
        <FormItem enabled={algorithm?.properties.isMultiThreaded}>
          <h5 className="text-white mb-0 mx-2">Threads:</h5>
          <Value
            value={threadsCount}
            onChange={setThreadsCount}
            size={2}
            inputValidator={validators.isInteger}
            className="mx-2"
          />
          <Slider
            value={threadsCount}
            min={1}
            max={16}
            onChange={setThreadsCount}
            step={1}
            className="mx-2"
          />
        </FormItem>
      </Row>
      <Button
        enabled={isValid() && !loading}
        onClick={submit}
        variant="primary"
      >
        Analyze
      </Button>
    </>
  );
};

export default FunctionalDependencies;