function validateNumberInput(event: any) {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, '');
}

export{
    validateNumberInput
}
