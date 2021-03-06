import { errors } from '../../errors/errors'
import { validatePassword } from '../../helpers/validatePassword'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { processPassword, verify } from '../../utils/Password'
import { PasswordComplexConfiguration } from '../PasswordComplexConfiguration'
import { Token } from '../Tokens'

export const PasswordChangeSchema = (
  passwordComplex: PasswordComplexConfiguration,
) => ({ password }: { password: string }) => ({
  password: validatePassword(password, passwordComplex),
  oldPassword: validatePassword(password, passwordComplex),
})

export const PasswordChange = (verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)
  const { InvalidInput, InternalError } = errors

  try {
    const { user, tokenData } = ctx.state

    if (tokenData.data.meta.name !== Token.Login.meta.name) {
      ctx.status = InternalError.code
      ctx.body = InternalError.message
      return
    }

    const { password, oldPassword } = ctx.request.body

    await verify(oldPassword, user.password)
    user.password = await processPassword(password, pwnedCheckerRoot)
    const usersController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot)
    await usersController.update(user.id, user)

    ctx.status = 200
  } catch (exception) {
    logger.error({ exception }, 'api.PasswordChange')
    ctx.throw(InvalidInput.code, InvalidInput.message + ' ' + exception.message)
  }
}
