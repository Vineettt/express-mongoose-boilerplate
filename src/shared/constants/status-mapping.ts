const statusMapping: any = {
       CONNECT: 'SuccessOK',
       DELETE: 'SuccessOK',
       GET:'SuccessOK',
       HEAD:'SuccessOK',
       OPTIONS: 'SuccessOK',
       PATCH: 'SuccessOK',
       POST: 'SuccessCreated',
       PUT:'SuccessOK',
       TRACE: 'SuccessOK',
       CONNECT_ERROR: 'ServerErrorInternal',
       DELETE_ERROR: 'ClientErrorBadRequest',
       GET_ERROR:'ClientErrorBadRequest',
       HEAD_ERROR:'ClientErrorBadRequest',
       OPTIONS_ERROR: 'ServerErrorInternal',
       PATCH_ERROR: 'ClientErrorBadRequest',
       POST_ERROR: 'ClientErrorBadRequest',
       PUT_ERROR:'ClientErrorBadRequest',
       TRACE_ERROR: 'ServerErrorInternal',
       ACTIVATION_PENDING: 'ClientErrorForbidden' 
     }

module.exports = statusMapping;