interface AlertProps {
  variant: "error" | "warning" | "success" | "errorFill" | "warningFill" | "infoFill" | "successFill";
  children?: React.ReactNode;
  className?: string;
  show?: boolean
}

const colorPalette: {
  error: string,
  success: string,
  warning: string,
  errorFill: string,
  warningFill: string,
  infoFill: string,
  successFill: string
} = {
  error: "text-red-600",
  success: "text-green-600",
  warning: "text-orange-600",
  errorFill: "bg-red-100 !border-red-400 text-red-900 border px-5 py-3 rounded-lg",
  warningFill: "bg-yellow-100 !border-yellow-300 text-yellow-900 border px-5 py-3 rounded-lg",
  infoFill: "bg-sky-100 !border-sky-200 text-sky-900 border px-5 py-3 rounded-lg",
  successFill: "bg-green-100 !border-green-300 text-green-900 border px-5 py-3 rounded-lg",
}

function Alert(props: AlertProps) {
  if (props.show) {
    return (
      <p
        className={
          "my-2 " +
          (colorPalette[props.variant]) +
          (props.className ? " " + props.className : "")
        }
      >
        {props.children}
      </p>
    );
  } else {
    return (
      <></>
    )
  }
}

export default Alert;
