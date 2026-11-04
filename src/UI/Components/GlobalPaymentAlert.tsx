import React, {useEffect, useState} from 'react';
import CustomConfirmModal, {PaymentAlert} from './ConfirmationModal';

type PaymentAction = {
  text: string;
  onPress?: () => void;
};

const GlobalPaymentAlert = () => {
  const [data, setData] = useState<{
    Heading: string;
    text: string;
    actions?: PaymentAction[];
  } | null>(null);

  useEffect(() => {
    PaymentAlert.register((Heading, text, actions) => {
      setData({Heading, text, actions});
    });
    return () => PaymentAlert.register(null);
  }, []);

  if (!data) return null;

  return (
    <CustomConfirmModal
      visible={!!data}
      Heading={data.Heading}
      text={data.text}
      actions={data.actions}
      onOk={data.actions?.[0]?.onPress ?? (() => {})}
      onClose={() => setData(null)}
    />
  );
};

export default GlobalPaymentAlert;
