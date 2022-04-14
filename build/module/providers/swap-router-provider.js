import { SwapRouter02__factory } from '../types/other/factories/SwapRouter02__factory';
import { log } from '../util';
const SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
export class SwapRouterProvider {
    constructor(multicall2Provider) {
        this.multicall2Provider = multicall2Provider;
    }
    async getApprovalType(tokenInAmount, tokenOutAmount) {
        var _a, _b;
        const functionParams = [
            [
                tokenInAmount.currency.wrapped.address,
                tokenInAmount.quotient.toString(),
            ],
            [
                tokenOutAmount.currency.wrapped.address,
                tokenOutAmount.quotient.toString(),
            ],
        ];
        const tx = await this.multicall2Provider.callSameFunctionOnContractWithMultipleParams({
            address: SWAP_ROUTER_ADDRESS,
            contractInterface: SwapRouter02__factory.createInterface(),
            functionName: 'getApprovalType',
            functionParams,
        });
        if (!((_a = tx.results[0]) === null || _a === void 0 ? void 0 : _a.success) || !((_b = tx.results[1]) === null || _b === void 0 ? void 0 : _b.success)) {
            log.info({ results: tx.results }, 'Failed to get approval type from swap router for token in or token out');
            throw new Error('Failed to get approval type from swap router for token in or token out');
        }
        const { result: approvalTokenIn } = tx.results[0];
        const { result: approvalTokenOut } = tx.results[1];
        return {
            approvalTokenIn: approvalTokenIn[0],
            approvalTokenOut: approvalTokenOut[0],
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dhcC1yb3V0ZXItcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3N3YXAtcm91dGVyLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFROUIsTUFBTSxtQkFBbUIsR0FBRyw0Q0FBNEMsQ0FBQztBQXNCekUsTUFBTSxPQUFPLGtCQUFrQjtJQUM3QixZQUFzQixrQkFBc0M7UUFBdEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtJQUFHLENBQUM7SUFFekQsS0FBSyxDQUFDLGVBQWUsQ0FDMUIsYUFBdUMsRUFDdkMsY0FBd0M7O1FBRXhDLE1BQU0sY0FBYyxHQUF1QjtZQUN6QztnQkFDRSxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPO2dCQUN0QyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTthQUNsQztZQUNEO2dCQUNFLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU87Z0JBQ3ZDLGNBQWMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO2FBQ25DO1NBQ0YsQ0FBQztRQUVGLE1BQU0sRUFBRSxHQUNOLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLDRDQUE0QyxDQUd4RTtZQUNBLE9BQU8sRUFBRSxtQkFBbUI7WUFDNUIsaUJBQWlCLEVBQUUscUJBQXFCLENBQUMsZUFBZSxFQUFFO1lBQzFELFlBQVksRUFBRSxpQkFBaUI7WUFDL0IsY0FBYztTQUNmLENBQUMsQ0FBQztRQUVMLElBQUksQ0FBQyxDQUFBLE1BQUEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsMENBQUUsT0FBTyxDQUFBLElBQUksQ0FBQyxDQUFBLE1BQUEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsMENBQUUsT0FBTyxDQUFBLEVBQUU7WUFDdEQsR0FBRyxDQUFDLElBQUksQ0FDTixFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQ3ZCLHdFQUF3RSxDQUN6RSxDQUFDO1lBQ0YsTUFBTSxJQUFJLEtBQUssQ0FDYix3RUFBd0UsQ0FDekUsQ0FBQztTQUNIO1FBRUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBELE9BQU87WUFDTCxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNuQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7U0FDdEMsQ0FBQztJQUNKLENBQUM7Q0FDRiJ9