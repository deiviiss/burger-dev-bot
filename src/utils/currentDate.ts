import { format } from 'date-fns'

const getFullCurrentDate = (): string => {
  const currentD = new Date();
  const formatDate = format(currentD, 'yyyy/MM/dd HH:mm');
  const day = format(currentD, 'EEEE');

  return [
    formatDate,
    day,
  ].join(' ')

}

export { getFullCurrentDate }